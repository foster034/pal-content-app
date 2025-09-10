import { NextRequest, NextResponse } from 'next/server';

// MCP Protocol types
interface McpRequest {
  jsonrpc: string;
  id?: string | number;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: string;
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// Mock data for tech and marketing content
const mockTechs = [
  {
    id: 'alex-rodriguez',
    name: 'Alex Rodriguez',
    email: 'alex@popalock.com',
    phone: '(555) 111-2222',
    specialties: ['Automotive Locksmith', 'Roadside Assistance'],
    franchiseeName: 'Downtown'
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    email: 'david@popalock.com',
    phone: '(555) 333-4444',
    specialties: ['Residential Locksmith', 'Key Programming'],
    franchiseeName: 'Downtown'
  },
  {
    id: 'maria-garcia',
    name: 'Maria Garcia',
    email: 'maria@popalock.com',
    phone: '(555) 222-3333',
    specialties: ['Commercial Locksmith', 'Access Control'],
    franchiseeName: 'Westside'
  }
];

const mockMarketingContent = [
  {
    id: 1,
    category: 'Automotive',
    service: 'Car Lockout',
    location: 'Downtown Dallas, TX',
    description: 'Successfully unlocked customer\'s Honda Civic after keys were locked inside. Used professional lockout tools and completed service in 15 minutes.',
    submittedBy: 'Alex Rodriguez',
    submittedAt: '2024-09-08T10:30:00Z',
    status: 'Approved',
    customerSatisfaction: 5,
    vehicleYear: '2022',
    vehicleMake: 'Honda',
    vehicleModel: 'Civic'
  },
  {
    id: 2,
    category: 'Residential',
    service: 'Lock Installation',
    location: 'Austin, TX',
    description: 'Installed high-security deadbolt lock for homeowner. Explained operation and provided keys.',
    submittedBy: 'David Chen',
    submittedAt: '2024-09-07T14:15:00Z',
    status: 'Pending',
    customerSatisfaction: 5
  },
  {
    id: 3,
    category: 'Commercial',
    service: 'Master Key System',
    location: 'Houston, TX',
    description: 'Implemented comprehensive master key system for office building with 25 units.',
    submittedBy: 'Maria Garcia',
    submittedAt: '2024-09-06T09:45:00Z',
    status: 'Approved',
    customerSatisfaction: 4
  }
];

// Define available tools
const tools = {
  get_techs: {
    name: 'get_techs',
    description: 'Get a list of all Pop-A-Lock technicians',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  get_tech: {
    name: 'get_tech',
    description: 'Get details of a specific Pop-A-Lock technician',
    inputSchema: {
      type: 'object',
      properties: {
        techId: {
          type: 'string',
          description: 'The ID of the technician'
        }
      },
      required: ['techId']
    }
  },
  get_marketing_content: {
    name: 'get_marketing_content',
    description: 'Get marketing content submissions with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['Residential', 'Automotive', 'Commercial', 'Roadside'],
          description: 'Filter by service category'
        },
        status: {
          type: 'string',
          enum: ['Draft', 'Submitted', 'Approved', 'Published'],
          description: 'Filter by approval status'
        },
        techName: {
          type: 'string',
          description: 'Filter by technician name'
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          default: 10,
          description: 'Maximum number of results to return'
        }
      },
      required: []
    }
  },
  submit_marketing_content: {
    name: 'submit_marketing_content',
    description: 'Submit new marketing content for a Pop-A-Lock technician',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['Residential', 'Automotive', 'Commercial', 'Roadside'],
          description: 'Service category'
        },
        service: {
          type: 'string',
          description: 'Type of service performed'
        },
        location: {
          type: 'string',
          description: 'Job location'
        },
        description: {
          type: 'string',
          description: 'Description of the work performed'
        },
        submittedBy: {
          type: 'string',
          description: 'Name of the technician submitting the content'
        },
        customerSatisfaction: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Customer satisfaction rating (1-5 stars)'
        },
        vehicleYear: {
          type: 'string',
          description: 'Vehicle year (for automotive services)'
        },
        vehicleMake: {
          type: 'string',
          description: 'Vehicle make (for automotive services)'
        },
        vehicleModel: {
          type: 'string',
          description: 'Vehicle model (for automotive services)'
        }
      },
      required: ['category', 'service', 'location', 'description', 'submittedBy']
    }
  },
  get_service_categories: {
    name: 'get_service_categories',
    description: 'Get available service categories and their associated service types',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  decode_vin: {
    name: 'decode_vin',
    description: 'Decode a vehicle VIN using NHTSA database',
    inputSchema: {
      type: 'object',
      properties: {
        vin: {
          type: 'string',
          minLength: 17,
          maxLength: 17,
          description: '17-character Vehicle Identification Number'
        }
      },
      required: ['vin']
    }
  },
  generate_ai_summary: {
    name: 'generate_ai_summary',
    description: 'Generate a professional marketing summary using AI',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Service category'
        },
        service: {
          type: 'string',
          description: 'Service type'
        },
        location: {
          type: 'string',
          description: 'Job location'
        },
        description: {
          type: 'string',
          description: 'Initial description/notes'
        },
        techName: {
          type: 'string',
          description: 'Technician name'
        },
        customerSatisfaction: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Customer satisfaction rating'
        },
        vehicle: {
          type: 'string',
          description: 'Vehicle information (year make model)'
        }
      },
      required: ['category', 'service', 'techName']
    }
  }
};

async function handleMcpRequest(request: McpRequest): Promise<McpResponse> {
  const { id, method, params } = request;

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'Pop-A-Lock Content Management',
              version: '1.0.0'
            }
          }
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: Object.values(tools)
          }
        };

      case 'tools/call':
        const { name: toolName, arguments: toolArgs } = params;
        return await handleToolCall(toolName, toolArgs, id);

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        };
    }
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

async function handleToolCall(toolName: string, args: any, id?: string | number): Promise<McpResponse> {
  try {
    let result;

    switch (toolName) {
      case 'get_techs':
        result = {
          techs: mockTechs,
          count: mockTechs.length
        };
        break;

      case 'get_tech':
        const tech = mockTechs.find(t => t.id === args.techId);
        if (!tech) {
          throw new Error(`Tech with ID ${args.techId} not found`);
        }
        result = { tech };
        break;

      case 'get_marketing_content':
        let filteredContent = [...mockMarketingContent];
        const { category, status, techName, limit = 10 } = args;

        if (category) {
          filteredContent = filteredContent.filter(content => content.category === category);
        }
        if (status) {
          filteredContent = filteredContent.filter(content => content.status === status);
        }
        if (techName) {
          filteredContent = filteredContent.filter(content => 
            content.submittedBy.toLowerCase().includes(techName.toLowerCase())
          );
        }

        const results = filteredContent.slice(0, limit);
        result = {
          content: results,
          total: filteredContent.length,
          returned: results.length,
          filters: { category, status, techName, limit }
        };
        break;

      case 'submit_marketing_content':
        const newContent = {
          id: mockMarketingContent.length + 1,
          ...args,
          submittedAt: new Date().toISOString(),
          status: 'Submitted'
        };
        mockMarketingContent.push(newContent);
        result = {
          success: true,
          content: newContent,
          message: 'Marketing content submitted successfully'
        };
        break;

      case 'get_service_categories':
        const serviceCategories = {
          'Residential': [
            'Home Lockout', 'Lock Installation', 'Rekey Service', 'Smart Lock Installation',
            'Security Upgrade', 'Mailbox Lock Service', 'Safe Service', 'Window Lock Repair'
          ],
          'Automotive': [
            'Car Lockout', 'Duplicate Key Service', 'Key Programming', 'Ignition Repair',
            'Transponder Key', 'Remote Programming', 'Broken Key Extraction', 'Motorcycle Key Service'
          ],
          'Commercial': [
            'Office Lockout', 'Master Key System', 'Access Control Installation', 'High Security Locks',
            'Panic Hardware', 'File Cabinet Service', 'Keypad Installation', 'Business Rekey'
          ],
          'Roadside': [
            'Emergency Lockout', 'Mobile Key Service', '24/7 Assistance', 'Trunk Lockout',
            'Motorcycle Assistance', 'Fleet Vehicle Service', 'Emergency Key Making', 'Mobile Locksmith'
          ]
        };
        result = { serviceCategories };
        break;

      case 'decode_vin':
        try {
          const response = await fetch(
            `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${args.vin}?format=json`
          );
          
          if (!response.ok) {
            throw new Error('Failed to decode VIN');
          }

          const data = await response.json();
          const results = data.Results;
          
          const year = results.find((item: any) => item.Variable === 'Model Year')?.Value;
          const make = results.find((item: any) => item.Variable === 'Make')?.Value;
          const model = results.find((item: any) => item.Variable === 'Model')?.Value;
          
          if (year && make && model) {
            result = {
              success: true,
              vehicle: { year, make, model, vin: args.vin }
            };
          } else {
            result = {
              success: false,
              error: 'Could not decode vehicle information from VIN'
            };
          }
        } catch (error) {
          result = {
            success: false,
            error: 'Unable to decode VIN. Please check the VIN and try again.'
          };
        }
        break;

      case 'generate_ai_summary':
        const { category: cat, service, location, techName: technicianName, customerSatisfaction } = args;
        
        const satisfactionText = customerSatisfaction 
          ? ` The customer was ${customerSatisfaction === 5 ? 'extremely satisfied' : 
               customerSatisfaction === 4 ? 'very satisfied' :
               customerSatisfaction === 3 ? 'satisfied' : 'moderately satisfied'} with the service.`
          : '';

        const summary = `${technicianName} successfully completed a ${service} service${location ? ` in ${location}` : ''}. Professional ${cat?.toLowerCase()} locksmith services were provided with expertise and efficiency.${satisfactionText} This demonstrates Pop-A-Lock's commitment to quality service and customer satisfaction.`;

        result = {
          success: true,
          summary,
          generatedAt: new Date().toISOString()
        };
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: 'Tool execution error',
        data: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Pop-A-Lock Content Management MCP Server',
    version: '1.0.0',
    tools: Object.keys(tools),
    description: 'MCP server for Pop-A-Lock content management system'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as McpRequest;
    const response = await handleMcpRequest(body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error',
        data: error instanceof Error ? error.message : String(error)
      }
    }, { status: 400 });
  }
}