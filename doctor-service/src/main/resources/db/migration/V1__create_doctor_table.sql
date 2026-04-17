-- V1: Doctors tablosunun ilk kurulumu

CREATE TABLE IF NOT EXISTS doctors (
                                       id UUID NOT NULL,
                                       personel_no VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    specialty_code VARCHAR(50) NOT NULL,
    clinic_id BIGINT,
    status VARCHAR(20) NOT NULL,
    version BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT pk_doctors PRIMARY KEY (id),
    CONSTRAINT uk_doctors_personel_no UNIQUE (personel_no),
    CONSTRAINT uk_doctors_email UNIQUE (email)
    );