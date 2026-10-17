# Stage 1: Build application with Maven and Eclipse Temurin JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime environment with lightweight JRE 21 Alpine
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for enhanced security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
