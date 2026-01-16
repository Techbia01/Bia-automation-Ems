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
    
    // Ejecutar automáticamente todos los días a las 2:00 AM
    triggers {
        cron('H 2 * * *')  // Cambia 'H 2 * * *' por la hora que prefieras
        // Formato: MINUTO HORA DIA MES DIA_SEMANA
        // Ejemplos:
        // 'H 2 * * *' = Todos los días a las 2:00 AM
        // 'H 9 * * 1-5' = Lunes a Viernes a las 9:00 AM
        // 'H */6 * * *' = Cada 6 horas
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
                        sh 'npm run test:report'
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
                    // Publicar reportes HTML
                    archiveArtifacts artifacts: 'cypress/reports/**/*', allowEmptyArchive: true
                    // Publicar reporte HTML principal
                    publishHTML([
                        reportDir: 'cypress/reports',
                        reportFiles: 'report.html',
                        reportName: 'Reporte de Pruebas Cypress',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }
        
        stage('Resumen de Resultados') {
            steps {
                script {
                    try {
                        if (fileExists('cypress/reports/report.json')) {
                            def testResults = readFile(file: 'cypress/reports/report.json')
                            def json = readJSON(text: testResults)
                            env.TOTAL_TESTS = json.stats?.tests ?: 0
                            env.PASSED_TESTS = json.stats?.passes ?: 0
                            env.FAILED_TESTS = json.stats?.failures ?: 0
                            env.PENDING_TESTS = json.stats?.pending ?: 0
                            env.SUCCESS_RATE = env.TOTAL_TESTS.toInteger() > 0 ? 
                                ((env.PASSED_TESTS.toInteger() * 100) / env.TOTAL_TESTS.toInteger()).round(2) : 0
                            
                            echo """
                    ============================================
                    RESUMEN DE PRUEBAS AUTOMATIZADAS
                    ============================================
                    Total de pruebas: ${env.TOTAL_TESTS}
                    ✅ Exitosas: ${env.PASSED_TESTS}
                    ❌ Fallidas: ${env.FAILED_TESTS}
                    ⏸️  Pendientes: ${env.PENDING_TESTS}
                    Tasa de éxito: ${env.SUCCESS_RATE}%
                    ============================================
                    """
                            
                            if (env.FAILED_TESTS.toInteger() > 0) {
                                currentBuild.result = 'UNSTABLE'
                            }
                        } else {
                            echo '⚠️ No se pudo generar el reporte JSON. Las pruebas pueden haber fallado antes de completarse.'
                            env.TOTAL_TESTS = '0'
                            env.PASSED_TESTS = '0'
                            env.FAILED_TESTS = '0'
                            env.PENDING_TESTS = '0'
                            env.SUCCESS_RATE = '0'
                        }
                    } catch (Exception e) {
                        echo "⚠️ Error al leer el reporte: ${e.getMessage()}"
                        env.TOTAL_TESTS = '0'
                        env.PASSED_TESTS = '0'
                        env.FAILED_TESTS = '0'
                        env.PENDING_TESTS = '0'
                        env.SUCCESS_RATE = '0'
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completado exitosamente'
            script {
                def slackMessage = """
✅ *Pruebas Cypress - Todas las pruebas pasaron*

📊 *Resumen:*
• Total de pruebas: ${env.TOTAL_TESTS ?: 'N/A'}
• ✅ Exitosas: ${env.PASSED_TESTS ?: 'N/A'}
• ❌ Fallidas: ${env.FAILED_TESTS ?: 'N/A'}
• ⏸️ Pendientes: ${env.PENDING_TESTS ?: 'N/A'}
• 📈 Tasa de éxito: ${env.SUCCESS_RATE ?: 'N/A'}%

🔗 Ver reporte completo: ${env.BUILD_URL}HTML_20Report/
"""
                // Descomenta y configura para habilitar notificaciones por Slack
                // slackSend(
                //     channel: '#tu-canal',  // Cambia por el nombre de tu canal de Slack
                //     color: 'good',
                //     message: slackMessage
                // )
            }
        }
        failure {
            echo '❌ Pipeline falló'
            script {
                def slackMessage = """
❌ *Pruebas Cypress - Pipeline falló*

⚠️ El pipeline falló durante la ejecución. Revisa los logs para más detalles.

🔗 Ver logs: ${env.BUILD_URL}console
"""
                // Descomenta y configura para habilitar notificaciones por Slack
                // slackSend(
                //     channel: '#tu-canal',  // Cambia por el nombre de tu canal de Slack
                //     color: 'danger',
                //     message: slackMessage
                // )
            }
        }
        unstable {
            echo '⚠️ Pipeline completado con advertencias'
            script {
                def slackMessage = """
⚠️ *Pruebas Cypress - Algunas pruebas fallaron*

📊 *Resumen:*
• Total de pruebas: ${env.TOTAL_TESTS ?: 'N/A'}
• ✅ Exitosas: ${env.PASSED_TESTS ?: 'N/A'}
• ❌ Fallidas: ${env.FAILED_TESTS ?: 'N/A'}
• ⏸️ Pendientes: ${env.PENDING_TESTS ?: 'N/A'}
• 📈 Tasa de éxito: ${env.SUCCESS_RATE ?: 'N/A'}%

🔗 Ver reporte completo: ${env.BUILD_URL}HTML_20Report/
🔗 Ver logs: ${env.BUILD_URL}console
"""
                // Descomenta y configura para habilitar notificaciones por Slack
                // slackSend(
                //     channel: '#tu-canal',  // Cambia por el nombre de tu canal de Slack
                //     color: 'warning',
                //     message: slackMessage
                // )
            }
        }
        always {
            echo 'Limpiando archivos temporales...'
            // No limpiar los reportes, mantenerlos para revisión
            sh '''
                rm -rf node_modules/.cache
                rm -rf cypress/.cache
            '''
        }
    }
}








