// Jenkinsfile — CI/CD Pipeline for Online Code Compiler
//
// Stages:
// 1. Checkout code
// 2. Install npm dependencies
// 3. Build production bundle (vite)
// 4. Build Docker image
// 5. Push to Azure Container Registry
// 6. Deploy to Azure App Service
//
// Required: Azure CLI + Docker + Node.js installed on Jenkins machine
// Required: Run 'az login' once on the Jenkins machine so Azure CLI is authenticated

pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        ACR_NAME = 'codecompileacr'
        ACR_URL = 'codecompileacr.azurecr.io'
        IMAGE_NAME = 'online-code-compiler'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        APP_NAME = 'code-compile-app'
        RESOURCE_GROUP = 'code-compile-rg'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
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
                bat "docker build -t %ACR_URL%/%IMAGE_NAME%:%IMAGE_TAG% -t %ACR_URL%/%IMAGE_NAME%:latest ."
            }
        }

        stage('Push to Azure') {
            steps {
                echo '--- Pushing image to Azure Container Registry ---'
                bat "az acr login --name %ACR_NAME%"
                bat "docker push %ACR_URL%/%IMAGE_NAME%:%IMAGE_TAG%"
                bat "docker push %ACR_URL%/%IMAGE_NAME%:latest"
            }
        }

        stage('Deploy') {
            steps {
                echo '--- Deploying to Azure App Service ---'
                bat "az webapp config container set --resource-group %RESOURCE_GROUP% --name %APP_NAME% --container-image-name %ACR_URL%/%IMAGE_NAME%:%IMAGE_TAG% --container-registry-url https://%ACR_URL%"
                bat "az webapp restart --resource-group %RESOURCE_GROUP% --name %APP_NAME%"
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            echo "Deployed: ${ACR_URL}/${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Live at: https://${APP_NAME}.azurewebsites.net"
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
