export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Landing page for GET requests
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          name: "CF Code Reviewer",
          description: "AI-powered code review API running on Cloudflare Workers",
          usage: "POST /review with JSON body: { \"code\": \"your code here\", \"language\": \"python\" }",
          endpoints: {
            "POST /review": "Submit code for AI review",
            "POST /explain": "Get a plain-English explanation of code",
            "POST /suggest": "Get refactoring suggestions"
          },
          author: "Henry (Htet Myat Aung)",
          github: "https://github.com/HtetMyatAungg/cf-code-reviewer"
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed. Use GET or POST." }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    let body: { code?: string; language?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!body.code) {
      return new Response(JSON.stringify({ error: "Missing 'code' field in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const language = body.language || "unknown";
    let systemPrompt: string;

    switch (path) {
      case "/review":
        systemPrompt = `You are an expert code reviewer. Analyse the following ${language} code and provide:
1. **Bugs & Errors**: Any bugs, logic errors, or potential runtime issues
2. **Best Practices**: Violations of coding standards or best practices
3. **Performance**: Any performance concerns or inefficiencies
4. **Security**: Potential security vulnerabilities
5. **Overall Rating**: Rate the code quality from 1-10 with a brief summary

Be concise, specific, and actionable.`;
        break;

      case "/explain":
        systemPrompt = `You are a patient programming teacher. Explain the following ${language} code in plain English. 
Break down what each section does, explain any complex logic, and describe the overall purpose. 
Assume the reader is a beginner.`;
        break;

      case "/suggest":
        systemPrompt = `You are a senior software engineer. Suggest specific refactoring improvements for the following ${language} code. 
For each suggestion:
- Explain WHY the change improves the code
- Show the improved code snippet
Focus on readability, maintainability, and modern best practices.`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown endpoint. Use /review, /explain, or /suggest" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
    }

    try {
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: body.code }
        ],
        max_tokens: 1024
      });

      return new Response(JSON.stringify({
        endpoint: path,
        language: language,
        result: response.response
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "AI inference failed", details: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
} satisfies ExportedHandler<Env>;