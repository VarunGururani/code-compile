// Jenkinsfile — CI/CD Pipeline for Online Code Compiler
//
// Stages:
// 1. Checkout code
// 2. Install npm dependencies
// 3. Build production bundle (vite)
// 4. Build Docker image
// 5. Verify image
//
// Required: Docker + Node.js installed on Jenkins machine

pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        IMAGE_NAME = 'online-code-compiler'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        skipDefaultCheckout(false)
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                echo '--- Checking out source code ---'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '--- Installing npm packages ---'
                bat 'node --version'
                bat 'npm --version'
                bat 'npm install --no-audit --no-fund'
            }
        }

        stage('Build') {
            steps {
                echo '--- Building production bundle ---'
                bat 'call node_modules\\.bin\\vite.cmd build'
            }
        }

        stage('Docker Build') {
            steps {
                echo '--- Building Docker image ---'
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest ."
            }
        }

        stage('Verify') {
            steps {
                echo '--- Verifying Docker image ---'
                bat "docker images %IMAGE_NAME%"
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Image built: ${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Run with: docker run --rm -p 8080:8080 -e JDOODLE_CLIENT_ID=your-id -e JDOODLE_CLIENT_SECRET=your-secret ${IMAGE_NAME}:latest"
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
