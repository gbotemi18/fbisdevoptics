package models

// ClusterHealth represents a minimal health snapshot for a Kubernetes cluster.
type ClusterHealth struct {
	ClusterName string            `json:"clusterName"`
	Status      string            `json:"status"`
	Timestamp   string            `json:"timestamp"`
	Signals     map[string]string `json:"signals"`
}
