# Pop-A-Lock MCP Server

This is a Model Context Protocol (MCP) server for the Pop-A-Lock Content Management application. It provides AI assistants with the ability to interact with the Pop-A-Lock system for managing technician content, marketing submissions, and service information.

## Server Information

- **Name**: Pop-A-Lock Content Management MCP Server
- **Version**: 1.0.0
- **Endpoint**: `http://localhost:3000/api/mcp`

## Available Tools

### 1. get_techs
**Description**: Get a list of all Pop-A-Lock technicians
- **Input**: No parameters required
- **Returns**: List of technicians with their details (name, email, phone, specialties, franchise)

### 2. get_tech
**Description**: Get details of a specific Pop-A-Lock technician
- **Input**:
  - `techId` (string, required): The ID of the technician
- **Returns**: Detailed information about the specified technician

### 3. get_marketing_content
**Description**: Get marketing content submissions with optional filtering
- **Input**:
  - `category` (optional): Filter by service category (Residential, Automotive, Commercial, Roadside)
  - `status` (optional): Filter by approval status (Draft, Submitted, Approved, Published)
  - `techName` (optional): Filter by technician name
  - `limit` (optional): Maximum number of results (1-100, default: 10)
- **Returns**: Filtered list of marketing content submissions

### 4. submit_marketing_content
**Description**: Submit new marketing content for a Pop-A-Lock technician
- **Input** (all required unless noted):
  - `category` (required): Service category
  - `service` (required): Type of service performed
  - `location` (required): Job location
  - `description` (required): Description of work performed
  - `submittedBy` (required): Name of submitting technician
  - `customerSatisfaction` (optional): Rating from 1-5 stars
  - `vehicleYear` (optional): For automotive services
  - `vehicleMake` (optional): For automotive services
  - `vehicleModel` (optional): For automotive services
- **Returns**: Confirmation of successful submission

### 5. get_service_categories
**Description**: Get available service categories and their associated service types
- **Input**: No parameters required
- **Returns**: Complete list of service categories and types available

### 6. decode_vin
**Description**: Decode a vehicle VIN using the NHTSA database
- **Input**:
  - `vin` (required): 17-character Vehicle Identification Number
- **Returns**: Decoded vehicle information (year, make, model) or error if unable to decode

### 7. generate_ai_summary
**Description**: Generate a professional marketing summary using AI
- **Input** (required unless noted):
  - `category` (required): Service category
  - `service` (required): Service type
  - `techName` (required): Technician name
  - `location` (optional): Job location
  - `description` (optional): Initial description/notes
  - `customerSatisfaction` (optional): Customer satisfaction rating
  - `vehicle` (optional): Vehicle information
- **Returns**: AI-generated professional marketing summary

## Usage Examples

### Initialize Connection
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "your-client",
        "version": "1.0.0"
      }
    }
  }'
```

### List Available Tools
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

### Get All Technicians
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_techs",
      "arguments": {}
    }
  }'
```

### Submit Marketing Content
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "submit_marketing_content",
      "arguments": {
        "category": "Automotive",
        "service": "Car Lockout",
        "location": "Dallas, TX",
        "description": "Successfully unlocked customer vehicle in 10 minutes",
        "submittedBy": "Alex Rodriguez",
        "customerSatisfaction": 5,
        "vehicleYear": "2023",
        "vehicleMake": "Honda",
        "vehicleModel": "Civic"
      }
    }
  }'
```

### Decode VIN
```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "decode_vin",
      "arguments": {
        "vin": "1HGBH41JXMN109186"
      }
    }
  }'
```

## Integration with AI Assistants

This MCP server can be used with various AI assistants that support the Model Context Protocol, including:

- **Claude**: Connect via MCP configuration
- **Cursor**: Use with MCP client integration
- **VS Code with Copilot**: Via MCP extensions
- **Custom AI Applications**: Using the AI SDK MCP client

## Deployment

### Local Development
The server runs automatically when you start the Next.js development server:
```bash
npm run dev
```

### Production Deployment
For production deployment to Vercel:

1. **Deploy to Vercel**: The MCP server will be automatically deployed as part of your Next.js application
2. **Update Endpoint**: Use your Vercel deployment URL instead of localhost
3. **Environment Variables**: Ensure any required environment variables are set in your Vercel dashboard

### Authentication (Future Enhancement)
Currently, the server operates without authentication. For production use, consider implementing:
- OAuth integration using `withMcpAuth`
- API key authentication
- Rate limiting
- CORS configuration for specific domains

## Development Notes

- The server uses mock data for demonstration purposes
- All marketing content submissions are stored in memory (not persisted)
- VIN decoding uses the official NHTSA API
- AI summary generation currently uses a simple template (can be enhanced with OpenAI integration)

## Error Handling

The server implements proper MCP error responses:
- **-32700**: Parse error
- **-32601**: Method not found
- **-32603**: Internal error
- Tool-specific errors with descriptive messages

## Future Enhancements

1. **Database Integration**: Replace mock data with real database connections
2. **Authentication**: Add OAuth and API key support
3. **Real AI Integration**: Connect to OpenAI API for better summary generation
4. **Webhooks**: Add webhook support for real-time updates
5. **Caching**: Implement caching for frequently accessed data
6. **Logging**: Add comprehensive logging and monitoring