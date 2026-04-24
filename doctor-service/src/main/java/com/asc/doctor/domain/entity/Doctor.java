package com.asc.doctor.domain.entity;

import com.asc.doctor.domain.enums.DoctorStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE doctors SET is_deleted = true WHERE id = ?")
@SQLRestriction("is_deleted = false")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "personel_no", unique = true, nullable = false)
    private String personelNo;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true)
    private String email;

    private String phone;

    @Column(name = "specialty_code", nullable = false)
    private String specialtyCode; // Örn: KARD, DAHL

    @Column(name = "clinic_id")
    private Long clinicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoctorStatus status;

    // Eşzamanlılık (Concurrency) kontrolü için Optimistic Locking
    @Version
    private Long version;

    // Soft Delete (Yumuşak Silme) için bayrak
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Domain iş kuralları (Entity içindeki davranışlar)
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DoctorStatus.ACTIVE; // Varsayılan olarak aktif başlar
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // İş kuralları metodları ("Aggregate Root" mantığı)
    public void deactivate() {
        this.status = DoctorStatus.PASSIVE;
    }

    public void activate() {
        this.status = DoctorStatus.ACTIVE;
    }
}