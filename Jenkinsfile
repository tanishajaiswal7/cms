pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }
    }

    post {
        success {
            echo 'Build Successful 🚀'
        }
        failure {
            echo 'Build Failed ❌'
        }
    }
}