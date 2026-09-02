FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

ENV SPRING_PROFILES_ACTIVE=prod

CMD ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -jar target/UIEMAR-api-0.0.1-SNAPSHOT.jar"]
