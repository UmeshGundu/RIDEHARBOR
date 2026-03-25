package com.rideharbor.in.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rideharbor.in.entity.PaymentEntity;
import com.rideharbor.in.repository.PaymentRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository repo;

    @Autowired
    private EmailService emailService;

    public PaymentEntity savePayment(PaymentEntity payment) {
        payment.setTransactionId(UUID.randomUUID().toString());
        PaymentEntity savedPayment = repo.save(payment);
        emailService.sendBookingMail(savedPayment);

        return savedPayment;
    }

    public List<PaymentEntity> getAllPayments() {
        return repo.findAll();
    }

    // ADD this method inside the class
    public void deletePayment(Long id) {
        repo.deleteById(id);
    }

    public PaymentEntity updatePayment(Long id, PaymentEntity updated) {
        PaymentEntity existing = repo.findById(id).orElseThrow();
        existing.setName(updated.getName());
        existing.setMobile(updated.getMobile());
        existing.setLocation(updated.getLocation());
        existing.setJourneyDate(updated.getJourneyDate());
        existing.setCar(updated.getCar());
        existing.setEmail(updated.getEmail());
        existing.setLicenseNumber(updated.getLicenseNumber());
        return repo.save(existing);
    }
}