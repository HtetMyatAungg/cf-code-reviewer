# Project Prompt & Planning

## Goal
Build an AI-powered code review API on Cloudflare Workers to demonstrate proficiency with the Cloudflare developer platform, as part of the Software Engineering Internship (Summer 2026) application.

## Problem
Developers often push code without a second pair of eyes. Automated code review tools exist, but most are heavyweight, expensive, or require complex setup. I wanted to build something lightweight, fast, and globally accessible — running AI inference at the edge with zero infrastructure management.

## Design Decisions

### Why Cloudflare Workers?
- Serverless: no servers to manage, scales automatically
- Edge computing: runs close to the user across 330+ cities
- Workers AI binding gives direct access to LLMs without managing GPUs

### Why Llama 3.1 8B Instruct?
- Available natively through Workers AI — no external API keys needed
- Instruct-tuned model is ideal for structured analysis tasks like code review
- 8B parameter size balances quality with inference speed at the edge

### Why three endpoints?
- `/review` — full code analysis (bugs, best practices, performance, security, rating)
- `/explain` — plain-English explanation for beginners
- `/suggest` — specific refactoring suggestions with improved code snippets

Each endpoint uses a different system prompt to guide the model toward a specific type of analysis. This keeps the API simple while offering flexibility.

## Tech Stack
- **Runtime:** Cloudflare Workers
- **Language:** TypeScript
- **AI Model:** @cf/meta/llama-3.1-8b-instruct via Workers AI binding
- **Deployment:** Wrangler CLI

## Architecture
```
Client (POST /review) → Cloudflare Edge → Worker → Workers AI (Llama 3.1) → JSON Response
```

## What I Learned
- How Cloudflare Workers handle requests at the edge
- How Workers AI bindings connect serverless functions to LLM inference
- How to design system prompts that produce structured, useful output
- How to build a clean REST API with input validation and error handling in TypeScript
git add PROMPT.md
git commit -m "docs: add project prompt and design decisions"
git push
