package com.adminpersonal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class AdminPersonalApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminPersonalApplication.class, args);
    }
}
