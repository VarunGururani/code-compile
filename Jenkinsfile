// Jenkinsfile — CI/CD Pipeline for Online Code Compiler
//
// Stages:
// 1. Checkout code
// 2. Install npm dependencies
// 3. Build production bundle (vite)
// 4. Build Docker image
// 5. Deploy — stops old container, starts new one, website goes live
//
// Required: Docker + Node.js installed on Jenkins machine
// Required: Create C:\jenkins-env\.env with:
//   JDOODLE_CLIENT_ID=your-id
//   JDOODLE_CLIENT_SECRET=your-secret

pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        IMAGE_NAME = 'online-code-compiler'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        CONTAINER_NAME = 'code-compile'
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
                bat 'node node_modules/vite/bin/vite.js build'
            }
        }

        stage('Docker Build') {
            steps {
                echo '--- Building Docker image ---'
                bat "docker build -t %IMAGE_NAME%:%IMAGE_TAG% -t %IMAGE_NAME%:latest ."
            }
        }

        stage('Deploy') {
            steps {
                echo '--- Stopping old container (if running) ---'
                bat "docker stop %CONTAINER_NAME% 2>nul & docker rm %CONTAINER_NAME% 2>nul & echo ready"

                echo '--- Starting new container ---'
                bat "docker run -d --name %CONTAINER_NAME% -p 8080:8080 --env-file C:\\jenkins-env\\.env --restart unless-stopped %IMAGE_NAME%:latest"

                echo '--- Waiting for startup ---'
                bat 'ping -n 5 127.0.0.1 >nul'

                echo '--- Verifying container is running ---'
                bat "docker ps --filter name=%CONTAINER_NAME%"
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Website is LIVE at: http://localhost:8080"
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
