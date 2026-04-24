# 🏥 HBYS (Hastane Bilgi Yönetim Sistemi) - Mikroservis Mimarisi

Bu proje, **Spring Boot 3.x**, **Spring Cloud** ve **Docker** ekosistemi kullanılarak geliştirilmiş, kurumsal standartlarda tasarlanmış bir backend projesidir.

Sistem; **yüksek erişilebilirlik (High Availability)**, **hata toleransı (Resilience)**, **güvenlik**, **servis izolasyonu** ve **konteynerizasyon** prensipleri dikkate alınarak modern mikroservis mimarisiyle geliştirilmiştir.

---

## 🏗️ Sistem Mimarisi

Proje, her mikroservisin kendi sorumluluk alanına ve kendi veritabanına sahip olduğu **Database-per-Service** yaklaşımını temel alır.

Mikroservisler, izole bir Docker ağı içerisinde haberleşir. API istekleri dış dünyadan doğrudan servisler yerine **API Gateway** üzerinden sisteme giriş yapar.

Genel mimari yapı:

- Merkezi yönlendirme için **API Gateway**
- Servis keşfi için **Eureka Discovery Server**
- Kimlik ve erişim yönetimi için **Keycloak**
- Servisler arası senkron iletişim için REST tabanlı yapı
- Asenkron bildirim süreçleri için **RabbitMQ**
- Performans artırımı için **Redis Cache**
- Hata toleransı için **Resilience4j Circuit Breaker**
- Servis başına ayrı PostgreSQL veritabanı

---

## 🛰️ Servis Ekosistemi

| Servis Adı | Port | Açıklama |
|---|---:|---|
| **API Gateway** | `8082` | Merkezi giriş noktası, Swagger UI vitrini, güvenlik ve yönlendirme katmanı |
| **Discovery Server** | `8761` | Eureka Server; mikroservislerin kayıt ve keşif merkezi |
| **Keycloak** | `8080` | OIDC & OAuth2 tabanlı kimlik ve erişim yönetimi |
| **Patient Service** | `8083` | Hasta yönetimi işlemleri. Özel veritabanı: `patient_db` |
| **Doctor Service** | `8084` | Doktor yönetimi ve Redis cache işlemleri. Özel veritabanı: `hbbys_db` |
| **Appointment Service** | `8085` | Randevu yönetimi, servisler arası iletişim ve Circuit Breaker kullanımı. Özel veritabanı: `appointment_db` |
| **Notification Service** | Dinamik | RabbitMQ üzerinden asenkron SMS/e-posta bildirimlerini dinleyen servis |

---

## 🚀 Özellikler

### 🐋 Full Konteynerizasyon

Proje, altyapı servislerinden uygulama servislerine kadar tamamen Dockerize edilmiştir.

Docker Compose ile aşağıdaki bileşenler tek komutla ayağa kaldırılabilir:

- PostgreSQL
- Redis
- RabbitMQ
- Keycloak
- Discovery Server
- API Gateway
- Patient Service
- Doctor Service
- Appointment Service
- Notification Service

Multi-stage Dockerfile yapısı sayesinde optimize edilmiş Docker imajları oluşturulur.

---

### 💾 Kalıcı Veri Yönetimi

Veritabanı verilerinin konteyner silindiğinde kaybolmaması için **Docker Volume** kullanılmıştır.

Bu sayede PostgreSQL konteyneri yeniden oluşturulsa bile veriler korunur.

---

### 🛡️ Resilience4j Circuit Breaker

`appointment-service`, diğer mikroservislerle iletişim kurarken yaşanabilecek servis kesintileri, zaman aşımı veya ağ problemlerine karşı **Circuit Breaker** mekanizması ile korunur.

Örneğin:

- Hatalı istek oranı belirlenen eşiği aşarsa Circuit Breaker `OPEN` durumuna geçer.
- Trafik geçici olarak kesilir.
- Sistem gereksiz istek yükünden korunur.
- Servisin tamamen çökmesi engellenir.

Bu yapı özellikle randevu oluşturma gibi birden fazla servisle iletişim kurulan senaryolarda sistemin daha dayanıklı çalışmasını sağlar.

---

### 📖 Merkezi Swagger UI

Tüm mikroservislerin API dokümantasyonuna API Gateway üzerinden tek bir noktadan erişilebilir.

```text
http://localhost:8082/swagger-ui.html
```

Bu yapı sayesinde her servisin Swagger dokümantasyonuna ayrı ayrı gitmeye gerek kalmadan, tüm API uçları merkezi olarak görüntülenebilir.

---

### 🔑 Güvenlik ve Yetkilendirme

Projede kimlik doğrulama ve yetkilendirme işlemleri için **Keycloak** kullanılmıştır.

Güvenlik tarafında kullanılan temel yaklaşımlar:

- OAuth2 / OpenID Connect tabanlı kimlik doğrulama
- JWT Access Token ile güvenli istek yönetimi
- API Gateway seviyesinde token kontrolü
- Resource Server seviyesinde servis bazlı yetkilendirme
- Rol bazlı erişim kontrolü
- Kullanıcının sadece kendi verisine erişmesini sağlayan resource-level güvenlik yaklaşımı

---

### 🧩 IDOR Koruması

Projede sadece endpoint seviyesinde rol kontrolü yapılmaz. Aynı zamanda kullanıcının erişmeye çalıştığı kaynağın gerçekten o kullanıcıya ait olup olmadığı da kontrol edilir.

Bu yaklaşım, **IDOR (Insecure Direct Object Reference)** zafiyetlerine karşı ek güvenlik sağlar.

Örnek senaryo:

```text
Kullanıcı A, Kullanıcı B'ye ait hasta/randevu bilgisine erişmeye çalışırsa sistem bu isteği engeller.
```

Bu kontrol için JWT içerisindeki `sub` claim değeri kullanılarak kaynak sahibi doğrulanır.

---

## 🛠️ Kullanılan Teknolojiler

| Kategori | Teknolojiler |
|---|---|
| Backend | Java 17, Spring Boot 3.x |
| Mikroservis | Spring Cloud, Spring Cloud Gateway, Eureka Server |
| Güvenlik | Spring Security, OAuth2 Resource Server, Keycloak, JWT |
| Veritabanı | PostgreSQL |
| Cache | Redis |
| Message Broker | RabbitMQ |
| Resilience | Resilience4j Circuit Breaker |
| API Dokümantasyonu | Swagger / OpenAPI |
| Container | Docker, Docker Compose |
| Build Tool | Maven |

---

## 📁 Proje Yapısı

Örnek proje yapısı aşağıdaki gibidir:

```text
hbys-microservices/
│
├── api-gateway/
├── discovery-server/
├── patient-service/
├── doctor-service/
├── appointment-service/
├── notification-service/
│
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Kurulum ve Çalıştırma

### 1. Ön Gereksinimler

Projeyi çalıştırmadan önce aşağıdaki araçların kurulu olması gerekir:

- Java 17
- Maven 3.8+
- Docker
- Docker Desktop

---

### 2. Projeyi Paketleme

Projenin ana dizininde aşağıdaki komutu çalıştırın:

```bash
mvn clean package -DskipTests
```

Bu komut, mikroservislerin çalıştırılabilir `.jar` dosyalarını üretir.

---

### 3. Sistemi Docker Compose ile Başlatma

Aşağıdaki komut ile tüm altyapı ve uygulama servisleri ayağa kaldırılır:

```bash
docker-compose up --build -d
```

Servislerin durumunu kontrol etmek için:

```bash
docker-compose ps
```

Logları görüntülemek için:

```bash
docker-compose logs -f
```

Belirli bir servisin loglarını görüntülemek için:

```bash
docker-compose logs -f appointment-service
```

---

## 🗄️ Veritabanı Hazırlığı

Proje, servis başına ayrı veritabanı yaklaşımı kullandığı için ilk çalıştırmada bazı veritabanlarının oluşturulması gerekebilir.

PostgreSQL üzerinde aşağıdaki veritabanlarının mevcut olduğundan emin olun:

```sql
CREATE DATABASE patient_db;
CREATE DATABASE appointment_db;
```

Doctor Service için kullanılan veritabanı:

```sql
CREATE DATABASE hbbys_db;
```

> Not: Veritabanları manuel olarak DBeaver, IntelliJ Database Tool veya SQL script aracılığıyla oluşturulabilir.

---

## 🌐 Önemli URL'ler

| Bileşen | URL |
|---|---|
| API Gateway | `http://localhost:8082` |
| Merkezi Swagger UI | `http://localhost:8082/swagger-ui.html` |
| Eureka Dashboard | `http://localhost:8761` |
| Keycloak Admin Panel | `http://localhost:8080` |
| RabbitMQ Management UI | `http://localhost:15672` |

---

## 🔄 Örnek Sistem Akışı

Randevu oluşturma senaryosunda sistem genel olarak aşağıdaki şekilde çalışır:

1. Kullanıcı, API Gateway üzerinden randevu oluşturma isteği gönderir.
2. API Gateway JWT token doğrulaması yapar.
3. İstek `appointment-service` servisine yönlendirilir.
4. `appointment-service`, hasta ve doktor bilgilerini ilgili servislerden kontrol eder.
5. Servisler arası iletişim sırasında Circuit Breaker aktif olarak çalışır.
6. Randevu başarıyla oluşturulur.
7. RabbitMQ üzerinden bildirim mesajı yayınlanır.
8. `notification-service`, mesajı dinleyerek SMS/e-posta bildirim sürecini başlatır.

---
