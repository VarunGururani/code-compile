pipeline {
    agent any

    environment {
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
                bat 'npm run build'
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
                echo '--- Stopping and removing old container (if running) ---'
                bat "docker rm -f %CONTAINER_NAME% 2>nul & echo ready"

                echo '--- Releasing port 8080 from any conflicting containers ---'
                bat "for /f \"tokens=*\" %%i in ('docker ps -q --filter \"publish=8080\"') do docker rm -f %%i"

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
