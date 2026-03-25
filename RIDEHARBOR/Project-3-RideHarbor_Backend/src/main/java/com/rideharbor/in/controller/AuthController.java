package com.rideharbor.in.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.rideharbor.in.entity.User;
import com.rideharbor.in.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String mobile = request.get("mobileNumber");
        service.sendOtp(username, mobile);
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully");
        return response;
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@RequestBody Map<String, String> request) {
        String mobile = request.get("mobileNumber");
        String otp = request.get("otp");
        Map<String, String> response = new HashMap<>();
        User user = service.findByMobile(mobile);
        if (user != null && user.getOtp() != null && user.getOtp().equals(otp)) {
            response.put("status", "success");
            response.put("username", user.getUsername());
        } else {
            response.put("status", "failed");
        }
        return response;
    }

    @PostMapping("/check-mobile")
    public Map<String, Object> checkMobile(@RequestBody Map<String, String> request) {
        String mobile = request.get("mobileNumber");
        Map<String, Object> response = new HashMap<>();
        User user = service.findByMobile(mobile);
        if (user != null) {
            response.put("exists", true);
            response.put("username", user.getUsername());
        } else {
            response.put("exists", false);
        }
        return response;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }
}