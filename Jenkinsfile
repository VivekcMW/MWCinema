pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.47.0-jammy'
      args '-u root:root'
    }
  }

  options {
    timestamps()
    ansiColor('xterm')
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    CI = 'true'
    NODE_ENV = 'test'
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps chromium'
      }
    }

    stage('Typecheck & Build') {
      steps {
        sh 'npx tsc --noEmit'
        sh 'npm run build'
      }
    }

    stage('Run Cucumber Tests') {
      steps {
        sh 'npm run bdd'
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
          publishHTML(target: [
            reportDir: 'reports',
            reportFiles: 'cucumber.html',
            reportName: 'Cucumber Report',
            keepAll: true,
            alwaysLinkToLastBuild: true,
            allowMissing: true
          ])
        }
      }
    }
  }

  post {
    failure {
      echo 'Pre-deploy gate failed — blocking deploy.'
    }
    success {
      echo 'Pre-deploy gate green — deploy pipeline may proceed.'
    }
  }
}
