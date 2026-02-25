pipeline {
    agent any

    stages {

        stage('Install Backend Dependencies') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            agent {
                docker {
                    image 'node:18-alpine'
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }
    }
}