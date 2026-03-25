package com.rideharbor.in.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.rideharbor.in.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByMobileNumber(String mobileNumber);

}