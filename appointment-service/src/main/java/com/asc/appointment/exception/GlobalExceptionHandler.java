package com.asc.appointment.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Optimistic Lock Hatasını Yakalar (Aynı randevuyu iki kişi GÜNCELLEMEYE çalışırsa)
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleOptimisticLockingException(ObjectOptimisticLockingFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("İşlem reddedildi: Bu randevu üzerinde sizden saniyeler önce başka bir işlem yapıldı. Lütfen sayfayı yenileyip tekrar deneyin.");
    }

    // Kısmi Unique Index Hatasını Yakalar (Aynı saatte iki randevu OLUŞTURULMAYA çalışılırsa)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Üzgünüz, seçtiğiniz randevu saati saniyeler önce başka bir hasta tarafından rezerve edildi!");
    }
}