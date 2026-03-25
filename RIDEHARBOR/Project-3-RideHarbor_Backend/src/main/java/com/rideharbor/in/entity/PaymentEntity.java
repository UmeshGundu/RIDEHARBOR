package com.rideharbor.in.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Instant_Booking_Transactions")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String mobile;
    private String car;
    private String duration;
    private String pickupTime;
    private String returnTime;
    private Double amount;
    private String transactionId;

    private String location;
    private String journeyDate;
    private String licenseNumber;
    // Add this field to PaymentEntity.java alongside the other fields
    private String bookingType;

}