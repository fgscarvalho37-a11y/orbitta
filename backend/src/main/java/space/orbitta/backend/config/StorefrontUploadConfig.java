package space.orbitta.backend.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorefrontUploadConfig {
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        return new MultipartConfigElement("", 4_000_000L, 5_000_000L, 0);
    }
}
