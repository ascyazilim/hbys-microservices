CREATE TABLE IF NOT EXISTS appointments (
                                            id UUID NOT NULL,
                                            doctor_id UUID NOT NULL,
                                            patient_id BIGINT NOT NULL,
                                            appointment_time TIMESTAMP NOT NULL,
                                            status VARCHAR(20) NOT NULL,
    version BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT pk_appointments PRIMARY KEY (id)
    );