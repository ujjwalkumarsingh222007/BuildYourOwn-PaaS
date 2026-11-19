"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchDeployments,
  fetchDeployment,
  rollbackDeployment,
} from "@/services/api"

export function useDeployments(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ["deployments", { projectId }] : ["deployments"],
    queryFn: () => fetchDeployments(projectId),
    refetchInterval: (query) => {
      const list = query.state.data
      if (Array.isArray(list) && list.some((d) => d.status === "building" || d.status === "deploying")) {
        return 1500
      }
      return false
    },
  })
}

export function useDeployment(id: string) {
  return useQuery({
    queryKey: ["deployments", id],
    queryFn: () => fetchDeployment(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "building" || status === "deploying") {
        return 1500
      }
      return false
    },
  })
}

export function useRollbackDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deploymentId: string) => rollbackDeployment(deploymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] })
    },
  })
}
