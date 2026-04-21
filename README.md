# 🏥 HBYS (Hastane Bilgi Yönetim Sistemi) - Mikroservis Mimarisi

Bu proje, modern yazılım mimarisi prensipleri gözetilerek **Spring Boot** ve **Spring Cloud** ile geliştirilmiş, kapsamlı bir Hastane Bilgi Yönetim Sistemi (HBYS) arka uç (backend) projesidir. Sistem, yüksek ölçeklenebilirlik, asenkron iletişim, performans optimizasyonu ve üst düzey güvenlik standartları (OAuth2/OpenID Connect) hedeflenerek tamamen mikroservis mimarisi üzerine inşa edilmiştir.

## 🚀 Kullanılan Teknolojiler ve Araçlar

**Backend & Mimari:**
* **Java 17 & Spring Boot 3.x**
* **Spring Cloud** (Gateway, Netflix Eureka, OpenFeign)
* **Veritabanı:** PostgreSQL
* **Veritabanı Göçü:** Flyway
* **DTO Mapping:** MapStruct & Java Records
* **Asenkron İletişim:** RabbitMQ (Spring AMQP)
* **Önbellekleme (Caching):** Redis (Cache-Aside Pattern)

**Güvenlik:**
* **Keycloak:** Identity and Access Management (IAM)
* **Spring Security & OAuth2 Resource Server:** JWT Tabanlı Doğrulama
* **PBAC/RBAC:** Yetki (Authority) tabanlı erişim kontrolü
* **IDOR Koruması:** Kaynak seviyesinde (Resource-Level) erişim güvenliği

**DevOps & Altyapı:**
* **Docker & Docker Compose** (Altyapı servisleri için)
* **Maven**

---

## 🏗️ Sistem Mimarisi ve Servisler

Proje, görevlerin bağımsız modüllere ayrıldığı "Domain-Driven Design" (Etki Alanı Güdümlü Tasarım) yaklaşımına benzer bir yapıdadır.

| Servis Adı | Port | Görevi / Açıklaması |
| :--- | :--- | :--- |
| **API Gateway** | `8082` | Sistemin dış dünyaya açılan tek kapısı. Gelen JWT token'ları doğrular ve istekleri ilgili servislere yönlendirir (Routing & Load Balancing). |
| **Discovery Server** | `8761` | Eureka Server. Tüm mikroservislerin kendini kaydettiği ve birbirini bulduğu santral. |
| **Keycloak (Docker)** | `8080` | Kullanıcı doğrulama, yetkilendirme ve token (JWT) üretimi. |
| **Appointment Service** | `8085` | Randevu oluşturma, iptal etme, çakışma (Double Booking) kontrolü. |
| **Patient Service** | Dinamik | Hasta kayıtları ve yönetimi. |
| **Doctor Service** | Dinamik | Doktor bilgileri ve uzmanlık alanları yönetimi. |

---

## ✨ Öne Çıkan Gelişmiş Özellikler

### 🔐 Üst Düzey Güvenlik (Security First)
* **Yetki Tabanlı Erişim (Authority-Based Access):** Klasik rol (`ROLE_ADMIN`) mantığı yerine, `APPOINTMENT_CREATE`, `PATIENT_READ` gibi ince ayarlı (fine-grained) yetkilendirme sistemi kurulmuştur.
* **IDOR Koruması:** Kullanıcıların sadece kendilerine ait verilere ulaşabilmesi için, JWT içindeki `sub` (Keycloak User ID) claim'i ile URL'den gelen ID'ler çarpıştırılarak Güvensiz Doğrudan Nesne Başvurusu (IDOR) zafiyeti engellenmiştir.

### ⚡ Performans ve Önbellekleme (Redis Cache)
* Servisler arası iletişim ağ trafiğini azaltmak için **Redis** kullanılmıştır.
* `appointment-service`, randevu oluştururken hasta ve doktor doğrulamasını **Cache-Aside** tasarım deseniyle yapar. Veri Redis'te varsa anında getirilir (Cache Hit), yoksa OpenFeign ile ilgili servise gidilir ve sonuç Redis'e yazılır. Spring Proxy mekanizması kullanılarak "Self-Invocation" sorunu çözülmüştür.

### 🔄 Asenkron İletişim (RabbitMQ)
* Randevu başarıyla oluşturulduğu an `appointment-service`, RabbitMQ kuyruğuna (`appointment.created.queue`) **AppointmentCreatedEvent** fırlatır. Bu sayede bildirim (SMS/Email) gibi uzun süren işlemler ana akışı yavaşlatmaz, asenkron olarak işlenir.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Altyapı Servislerini Ayağa Kaldırma
Proje dizinindeki `docker-compose.yml` dosyası, sistemin ihtiyaç duyduğu veritabanı, message broker, cache ve security servislerini barındırır.
```bash
docker-compose up -d
```
*Bu komut PostgreSQL, Keycloak, RabbitMQ ve Redis container'larını ayağa kaldıracaktır.*

### 2. Keycloak Yapılandırması
* `http://localhost:8080` adresinden Keycloak paneline giriş yapın.
* **`hbys-realm`** adında yeni bir realm oluşturun.
* Bir client (örn: `hbys-client`) ve kullanıcılar oluşturup, `realm_roles` üzerinden gerekli yetkileri (`APPOINTMENT_CREATE`, `APPOINTMENT_READ` vb.) atayın.

### 3. Mikroservisleri Çalıştırma
Sırasıyla aşağıdaki servisleri çalıştırın:
1. `discovery-server` (Eureka)
2. `api-gateway`
3. `patient-service`, `doctor-service`, `appointment-service` (Sırası fark etmez)

### 4. API Testi
İstekleri doğrudan mikroservislere değil, **API Gateway (`8082`)** üzerinden göndermelisiniz. 
Öncelikle Keycloak'tan geçerli bir **Bearer Token** alınmalı ve isteklerin `Authorization` header'ına eklenmelidir.

```http
POST http://localhost:8082/api/appointments
Authorization: Bearer <TOKEN>
