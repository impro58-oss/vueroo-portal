import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { agent } = await request.json();
    
    // Validate agent name
    const validAgents = [
      'consulting_scout',
      'smart_money_tracker',
      'idea_synthesizer',
      'medtech_intel',
      'synergy_mapper'
    ];
    
    if (!validAgents.includes(agent)) {
      return NextResponse.json(
        { error: 'Invalid agent name' },
        { status: 400 }
      );
    }
    
    // In production, this would queue to a worker or trigger the agent
    // For now, return success indicating manual run is needed
    return NextResponse.json({
      message: `Agent ${agent} run request received`,
      status: 'pending',
      note: 'Run agents manually via: python orchestrator.py --agent ' + agent
    });
    
  } catch (error) {
    console.error('Run agent error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger agent' },
      { status: 500 }
    );
  }
}
