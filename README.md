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
