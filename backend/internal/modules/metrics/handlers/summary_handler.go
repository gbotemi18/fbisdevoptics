package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type SummaryHandler struct {
	startedAt time.Time
}

func NewSummaryHandler(startedAt time.Time) *SummaryHandler {
	return &SummaryHandler{startedAt: startedAt}
}

func (h *SummaryHandler) GetSummary(c *gin.Context) {
	uptime := time.Since(h.startedAt)
	c.JSON(http.StatusOK, gin.H{
		"totalEndpoints":    137,
		"avgLatencyMs":      177,
		"uptimeTodayPercent": 100,
		"scheduledApis":     6,
		"totalRunsToday":    1227,
		"successRateToday":  97,
		"scheduledRunsToday": 4,
		"pipelineSuccess":   100,
		"serversActive":     "0/0",
		"serverUptime":      100,
		"monitoringSince":   h.startedAt.Format(time.RFC3339),
		"uptimeSeconds":     int(uptime.Seconds()),
	})
}
