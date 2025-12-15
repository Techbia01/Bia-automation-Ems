pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18' // Ajusta según tu versión de Node.js
        CYPRESS_BASE_URL = 'https://web.dev.bia.app'
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Obteniendo código del repositorio...'
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                echo 'Configurando Node.js...'
                script {
                    // Instalar Node.js usando nvm o tool
                    sh '''
                        if command -v nvm &> /dev/null; then
                            nvm use ${NODE_VERSION}
                        elif [ -f ~/.nvm/nvm.sh ]; then
                            source ~/.nvm/nvm.sh
                            nvm use ${NODE_VERSION}
                        fi
                        node --version
                        npm --version
                    '''
                }
            }
        }
        
        stage('Instalar dependencias') {
            steps {
                echo 'Instalando dependencias de npm...'
                sh 'npm ci'
            }
        }
        
        stage('Ejecutar pruebas Cypress') {
            steps {
                echo 'Ejecutando pruebas E2E con Cypress...'
                script {
                    try {
                        sh 'npm test'
                    } catch (error) {
                        echo "Las pruebas fallaron: ${error}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    echo 'Publicando artefactos de Cypress...'
                    // Publicar videos de pruebas
                    archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
                    // Publicar screenshots de fallos
                    archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
                    // Publicar reportes si los generas
                    archiveArtifacts artifacts: 'cypress/reports/**/*', allowEmptyArchive: true
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completado exitosamente'
        }
        failure {
            echo '❌ Pipeline falló'
        }
        always {
            echo 'Limpiando archivos temporales...'
            cleanWs()
        }
    }
}

