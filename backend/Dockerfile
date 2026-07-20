# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app

# Copy the pom.xml file to download dependencies
COPY pom.xml .
# Download dependencies as a separate step to cache them
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application, skipping tests to speed up the process
RUN mvn package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-focal
WORKDIR /app

# Copy the built jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
