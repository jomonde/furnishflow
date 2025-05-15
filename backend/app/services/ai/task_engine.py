from typing import Dict, List
import openai
from datetime import datetime, timedelta

class TaskEngine:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    async def generate_follow_up_tasks(self, client_data: Dict) -> List[Dict]:
        """Generate follow-up tasks based on client history and status."""
        
        last_contact = datetime.fromisoformat(client_data.get('last_contact', datetime.now().isoformat()))
        days_since_contact = (datetime.now() - last_contact).days

        context = f"""
        Client Details:
        - Name: {client_data['first_name']} {client_data['last_name']}
        - Days since last contact: {days_since_contact}
        - Lifetime spend: ${client_data.get('lifetime_spend', 0):,.2f}
        - Recent purchases: {client_data.get('recent_purchases', 'None')}
        - Status: {client_data.get('status', 'New')}
        """

        prompt = f"""
        Based on this customer information, suggest up to 3 follow-up tasks:
        {context}

        Each task should include:
        1. Title
        2. Priority (high/medium/low)
        3. Suggested timeframe
        4. Brief description of why this task matters
        """

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in customer relationship management."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            # Parse the AI response into structured tasks
            tasks = []
            raw_suggestions = response.choices[0].message.content.strip().split('\n\n')
            
            for suggestion in raw_suggestions:
                if not suggestion.strip():
                    continue
                    
                task = {
                    "title": suggestion.split('\n')[0].strip(),
                    "priority": "medium",  # Default priority
                    "due_date": (datetime.now() + timedelta(days=7)).isoformat(),  # Default due date
                    "description": suggestion,
                    "client_id": client_data['id'],
                    "type": "ai_generated"
                }
                
                # Extract priority if mentioned
                if 'priority' in suggestion.lower():
                    if 'high' in suggestion.lower():
                        task['priority'] = 'high'
                    elif 'low' in suggestion.lower():
                        task['priority'] = 'low'
                
                tasks.append(task)
            
            return tasks

        except Exception as e:
            return [{
                "error": str(e),
                "client_id": client_data['id'],
                "type": "error"
            }]

    async def prioritize_leads(self, leads: List[Dict]) -> List[Dict]:
        """Analyze and prioritize leads based on various factors."""
        
        leads_context = "\n".join([
            f"Lead {i+1}:"
            f"- Name: {lead['first_name']} {lead['last_name']}\n"
            f"- Last Contact: {lead.get('last_contact', 'Never')}\n"
            f"- Interest Level: {lead.get('interest_level', 'Unknown')}\n"
            f"- Notes: {lead.get('notes', 'No notes')}\n"
            for i, lead in enumerate(leads)
        ])

        prompt = f"""
        Analyze these leads and rank them by priority (1-5, 5 being highest):
        {leads_context}

        For each lead provide:
        1. Priority score (1-5)
        2. Brief reasoning
        3. Suggested next action
        """

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in sales lead prioritization."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            analysis = response.choices[0].message.content.strip()
            
            # Update leads with AI insights
            for lead in leads:
                lead_name = f"{lead['first_name']} {lead['last_name']}"
                if lead_name in analysis:
                    lead_section = analysis.split(lead_name)[1].split("\n\n")[0]
                    lead['ai_priority'] = int(lead_section[0]) if lead_section[0].isdigit() else 3
                    lead['ai_insights'] = lead_section.strip()
            
            # Sort leads by AI priority
            return sorted(leads, key=lambda x: x.get('ai_priority', 0), reverse=True)

        except Exception as e:
            return [{"error": str(e)} for _ in leads]
