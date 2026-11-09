import { Template } from '../../src/api/template';
import { Workflow } from '../../src/api/workflow';
import { WorkflowSpec } from '../../src/api/workflow-spec';
import { IoArgoprojWorkflowV1Alpha1Workflow } from '../../src/workflow-interfaces/data-contracts';

const pluginServer = `import json
from http.server import BaseHTTPRequestHandler, HTTPServer

class Plugin(BaseHTTPRequestHandler):
    def args(self):
        return json.loads(self.rfile.read(int(self.headers.get("Content-Length"))))

    def reply(self, reply):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(json.dumps(reply).encode("UTF-8"))

    def unsupported(self):
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/v1/template.execute":
            args = self.args()
            if "workflowLevelHello" in args["template"].get("plugin", {}):
                self.reply({
                    "node": {
                        "phase": "Succeeded",
                        "message": "Hello from a workflow-level executor plugin!"
                    }
                })
            else:
                self.reply({})
        else:
            self.unsupported()

if __name__ == "__main__":
    httpd = HTTPServer(("", 4356), Plugin)
    httpd.serve_forever()
`;

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1Workflow> {
    const mainTemplate = new Template('main', {
        plugin: {
            workflowLevelHello: {},
        },
    });

    return new Workflow({
        metadata: {
            generateName: 'workflow-level-executor-plugin-',
            labels: {
                'workflows.argoproj.io/no-test': 'environment',
            },
        },
        spec: new WorkflowSpec({
            entrypoint: mainTemplate,
            // Requires the ARGO_WORKFLOW_LEVEL_EXECUTOR_PLUGINS feature gate on the controller.
            executorPlugins: [
                {
                    metadata: {
                        name: 'workflow-level-hello-executor-plugin',
                    },
                    spec: {
                        sidecar: {
                            container: {
                                args: [pluginServer],
                                command: ['python', '-c'],
                                image: 'python:alpine3.23',
                                name: 'workflow-level-hello-executor-plugin',
                                ports: [{ containerPort: 4356 }],
                                resources: {
                                    limits: {
                                        cpu: '200m',
                                        memory: '64Mi',
                                    },
                                    requests: {
                                        cpu: '100m',
                                        memory: '32Mi',
                                    },
                                },
                                securityContext: {
                                    allowPrivilegeEscalation: false,
                                    capabilities: {
                                        drop: ['ALL'],
                                    },
                                    readOnlyRootFilesystem: true,
                                    runAsNonRoot: true,
                                },
                            },
                        },
                    },
                },
            ],
        }),
    }).toWorkflow();
}
