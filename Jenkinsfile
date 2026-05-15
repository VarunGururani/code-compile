// Jenkinsfile — Declarative Pipeline for Online Code Compiler
//
// SIMPLEST POSSIBLE SETUP:
// - No NodeJS plugin required
// - No Docker plugin required
// - Just needs Node.js installed on the Jenkins machine
//   (download from https://nodejs.org and install)
//
// If you installed Node.js on your Windows machine, Jenkins
// can use it directly since they share the same system.

pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
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
                bat 'docker build -t online-code-compiler:%BUILD_NUMBER% -t online-code-compiler:latest .'
            }
        }

        stage('Verify') {
            steps {
                echo '--- Verifying Docker image ---'
                bat 'docker images online-code-compiler'
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs above.'
        }
        always {
            cleanWs()
        }
    }
}
