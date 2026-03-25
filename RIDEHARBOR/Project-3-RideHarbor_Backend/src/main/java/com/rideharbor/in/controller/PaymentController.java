package com.rideharbor.in.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rideharbor.in.entity.PaymentEntity;
import com.rideharbor.in.service.PaymentService;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
})
public class PaymentController {

    @Autowired
    private PaymentService service;

    @PostMapping("/payment")
    public PaymentEntity makePayment(@RequestBody PaymentEntity payment) {
        return service.savePayment(payment);
    }

    @GetMapping("/bookings")
    public List<PaymentEntity> getAllBookings() {
        return service.getAllPayments();
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable Long id) {
        service.deletePayment(id);
        return ResponseEntity.ok(Map.of("status", "deleted", "id", String.valueOf(id)));
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<PaymentEntity> updateBooking(@PathVariable Long id, @RequestBody PaymentEntity updated) {
        return ResponseEntity.ok(service.updatePayment(id, updated));
    }
}