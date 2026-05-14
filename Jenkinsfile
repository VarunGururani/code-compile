// Jenkinsfile — Declarative Pipeline for Online Code Compiler
//
// Prerequisites on the Jenkins node:
//   - Node.js 20 (via NodeJS plugin or installed globally)
//   - Docker (for the Docker build stage)
//
// If using the Jenkins "NodeJS" plugin, configure a NodeJS installation
// named "Node20" in: Manage Jenkins → Tools → NodeJS installations.

pipeline {
    agent any

    tools {
        nodejs 'Node20'   // Must match the name configured in Jenkins Tools
    }

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
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install --no-audit --no-fund'
            }
        }

        stage('Build') {
            steps {
                echo '--- Building production bundle ---'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                echo '--- Building Docker image ---'
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Verify Image') {
            steps {
                echo '--- Verifying Docker image ---'
                sh "docker images ${IMAGE_NAME}"
                sh "docker inspect ${IMAGE_NAME}:${IMAGE_TAG} --format='{{.Config.ExposedPorts}}'"
            }
        }

    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Image built: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }
        always {
            echo '--- Cleaning workspace ---'
            cleanWs()
        }
    }
}
