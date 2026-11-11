
const openApiDocument = {
    openapi: "3.0.3",

    info: {
        title: "WorkPilot API",
        version: "1.0.0",
        description: "REST API for managing job applications."
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Local development server"
        }
    ],

    tags: [
        {
            name: "Applications",
            description: "Manage job applications"
        }
    ],

    paths: {
        "/": {
            get: {
                summary: "Get API information",
                responses: {
                    200: {
                        description: "API information retrieved successfully"
                    }
                }
            }
        },

        "/api/applications": {
            get: {
                tags: ["Applications"],
                summary: "Get all applications",
                responses: {
                    200: {
                        description: "List of applications"
                    }
                }
            },

            post: {
                tags: ["Applications"],
                summary: "Create a new application",

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/NewApplication"
                            }
                        }
                    }
                },

                responses: {
                    201: {
                        description: "Application created successfully"
                    },
                    400: {
                        description: "Invalid application data"
                    }
                }
            }
        },

        "/api/applications/{id}": {
            parameters: [
                {
                    name: "id",
                    in: "path",
                    required: true,
                    description: "Application UUID",
                    schema: {
                        type: "string",
                        format: "uuid"
                    }
                }
            ],

            get: {
                tags: ["Applications"],
                summary: "Get an application by ID",
                responses: {
                    200: {
                        description: "Application retrieved successfully"
                    },
                    404: {
                        description: "Application not found"
                    }
                }
            },

            put: {
                tags: ["Applications"],
                summary: "Update an application",

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ApplicationUpdate"
                            }
                        }
                    }
                },

                responses: {
                    200: {
                        description: "Application updated successfully"
                    },
                    400: {
                        description: "Invalid application data"
                    },
                    404: {
                        description: "Application not found"
                    }
                }
            },

            delete: {
                tags: ["Applications"],
                summary: "Delete an application",
                responses: {
                    200: {
                        description: "Application deleted successfully"
                    },
                    404: {
                        description: "Application not found"
                    }
                }
            }
        }
    },

    components: {
        schemas: {
            Application: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        format: "uuid"
                    },
                    company: {
                        type: "string"
                    },
                    position: {
                        type: "string"
                    },
                    status: {
                        type: "string",
                        enum: [
                            "saved",
                            "applied",
                            "interview",
                            "rejected",
                            "accepted"
                        ]
                    },
                    appliedAt: {
                        type: "string",
                        format: "date-time"
                    }
                },
                required: [
                    "id",
                    "company",
                    "position",
                    "status",
                    "appliedAt"
                ]
            },

            NewApplication: {
                type: "object",
                properties: {
                    company: {
                        type: "string"
                    },
                    position: {
                        type: "string"
                    },
                    status: {
                        type: "string",
                        enum: [
                            "saved",
                            "applied",
                            "interview",
                            "rejected",
                            "accepted"
                        ],
                        default: "applied"
                    }
                },
                required: ["company", "position"]
            },

            ApplicationUpdate: {
                type: "object",
                properties: {
                    company: {
                        type: "string"
                    },
                    position: {
                        type: "string"
                    },
                    status: {
                        type: "string",
                        enum: [
                            "saved",
                            "applied",
                            "interview",
                            "rejected",
                            "accepted"
                        ]
                    }
                },
                minProperties: 1
            }
        }
    }
};

module.exports = openApiDocument;
