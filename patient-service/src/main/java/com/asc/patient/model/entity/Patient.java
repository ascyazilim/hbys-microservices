package com.asc.patient.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE patients SET is_deleted = true WHERE id = ?") // Silme komutunu güncellemeye çevirir
@SQLRestriction("is_deleted = false") // Tüm SELECT sorgularına otomatik 'WHERE is_deleted = false' ekler
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tc_no", unique = true, nullable = false, length = 11)
    private String tcNo;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "gender", length = 10)
    private String gender; // MALE, FEMALE

    // Kayıt oluşturulma zamanını tutmak iyi bir pratiktir
    @Column(name = "created_at")
    private LocalDate createdAt;

    @Version // Optimistic Locking
    private Long version;

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDate.now();
    }
}
