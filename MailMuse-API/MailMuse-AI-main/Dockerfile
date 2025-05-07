# Use Maven to build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Use OpenJDK to run the application
FROM openjdk:17-jdk-slim
COPY --from=build /app/target/extension-0.0.1-SNAPSHOT.war /usr/local/lib/app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/usr/local/lib/app.war"]
