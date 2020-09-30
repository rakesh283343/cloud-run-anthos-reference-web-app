// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"flag"
	monitor "github.com/GoogleCloudPlatform/cloud-run-anthos-reference-web-app/inventory-balance-monitor-service/src"
	cloudevents "github.com/cloudevents/sdk-go/v2"
	"log"
)

func main() {
	log.Printf("server started")
	backendClusterHostName := flag.String("backend_cluster_host_name", "", "cluster hostname of the api service")
	flag.Parse()
	if *backendClusterHostName == "" {
		log.Fatal("backend_cluster_host_name must be set")
	}
	m := *monitor.NewInventoryBalanceMonitor(*backendClusterHostName)

	c, err := cloudevents.NewDefaultClient()
	if err != nil {
		log.Fatalf("Failed to create cloudevents client, %s", err)
	}
	log.Fatal(c.StartReceiver(context.Background(), m.Monitor))
}