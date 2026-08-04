package com.adminpersonal.deployment.infrastructure.scheduler;

import com.adminpersonal.deployment.domain.model.Deployment;
import com.adminpersonal.deployment.infrastructure.persistence.DeploymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Cada 10 minutos consulta APIs de Render/Vercel para deployments con platform_api_token
 * configurado, e importa los últimos deploys que no estén ya registrados como
 * DeploymentRecord (source=API_IMPORT).
 *
 * v1: implementación placeholder. Los clientes HTTP de Render/Vercel se agregarán
 * cuando se integren las APIs reales (requiere credenciales de prueba y conocer payloads).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApiPollingScheduler {

    private final DeploymentRepository deploymentRepository;

    @Scheduled(fixedDelay = 600_000) // 10 min
    @Transactional(readOnly = true)
    public void pollAllPlatforms() {
        List<Deployment> deployments = deploymentRepository.findAllWithPlatformApiToken();
        if (deployments.isEmpty()) return;
        log.debug("API polling: {} deployments con platform_api_token (placeholder, no acción en v1)",
            deployments.size());
        // TODO v2: implementar RenderApiClient.fetchLatestDeploys(token, serviceId)
        //          y VercelApiClient.fetchLatestDeploys(token, projectId)
        //          Crear DeploymentRecord source=API_IMPORT si version no existe.
    }
}
