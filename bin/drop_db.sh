#!/bin/sh

cat << EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: piazza-drop
  namespace: piazza
spec:
  template:
    spec:
      containers:
      - name: migrator
        image: gcr.io/piazza-247002/gql:0.2.1
        command: ["/opt/app/bin/gql",  "drop"]
        imagePullPolicy: Always
        envFrom:
        - secretRef:
            name: piazza-env
        env:
        - name: NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: RABBITMQ_PASSWORD
          valueFrom:
            secretKeyRef:
              name: {{ .Values.rabbitPasswordSecret }}
              key: rabbitmq-password
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: {{ .Values.dbPasswordSecret }}
              key: postgresql-password
      restartPolicy: Never
  backoffLimit: 5
EOF | kubectl apply -f