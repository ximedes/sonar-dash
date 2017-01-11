

function fetchMetrics() {
  return fetch('/api/metrics/search?f=name')
    .then( response => response.json())
    .then(json => json.metrics.reduce( (metrics, metric) => Object.assign(metrics, {[metric.key]: metric}), {}));
}

function fetchProjects() {
  return fetch('/api/projects/index')
    .then(response => response.json())
    .then(projects => projects.map(p => Object.assign({}, { id: p.id, key: p.k, name: p.nm} )));
}

function fetchProjectMeasures(projectKey, metricKeys) {
  return fetch('/api/measures/component?componentKey='+projectKey+'&qualifiers=TRK&metricKeys='+metricKeys.join(','))
    .then(response => response.json())
    .then(result => result.component);
}

function fetchProjectStatus(projectKey) {
  return fetch('/api/qualitygates/project_status?projectKey=' + projectKey)
    .then(res => res.json())
    .then(status => status.projectStatus);
}

export {fetchMetrics, fetchProjects, fetchProjectMeasures, fetchProjectStatus}