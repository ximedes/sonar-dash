const baseURL = "https://sonar.ximedes.com";
const headers = new Headers();
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("token")) {
  localStorage.setItem("token", urlParams.get("token"));
}

if (localStorage.getItem("token")) {
  const token = localStorage.getItem("token");
  headers.set("Authorization", `Basic ${btoa(token + ":")}`);
}

function fetchMetrics() {
  return fetch("/api/metrics/search?f=name", { headers })
    .then(response => response.json())
    .then(json =>
      json.metrics.reduce(
        (metrics, metric) => Object.assign(metrics, { [metric.key]: metric }),
        {}
      )
    );
}

function fetchProjectList() {
  return fetch("/api/projects/index", { headers })
    .then(response => response.json())
    .then(projects =>
      projects.map(p => Object.assign({}, { id: p.id, key: p.k, name: p.nm }))
    );
}

function fetchProjectMeasures(projectKey, metricKeys) {
  return fetch(
    "/api/measures/component?componentKey=" +
      projectKey +
      "&qualifiers=TRK&metricKeys=" +
      metricKeys.join(","),
    { headers }
  )
    .then(response => response.json())
    .then(result => result.component && result.component.measures);
}

function fetchProjectStatus(projectKey) {
  return fetch("/api/qualitygates/project_status?projectKey=" + projectKey, {
    headers
  })
    .then(res => res.json())
    .then(status => status.projectStatus);
}

function fetchLastTaskDetails(projectKey) {
  return fetch("/api/ce/component?componentKey=" + projectKey, { headers })
    .then(response => response.json())
    .then(tasks => tasks.current);
}

function fetchProjects(metricKeys) {
  return fetchProjectList().then(projects =>
    Promise.all(
      projects.map(p =>
        fetchProjectMeasures(p.key, metricKeys)
          .then(measures => Object.assign(p, { measures }))
          .then(p =>
            fetchProjectStatus(p.key).then(status =>
              Object.assign(p, { status })
            )
          )
          .then(p =>
            fetchLastTaskDetails(p.key).then(task =>
              Object.assign(p, { analysisDate: task && task.submittedAt })
            )
          )
      )
    )
  );
}

export { fetchMetrics, fetchProjects };
