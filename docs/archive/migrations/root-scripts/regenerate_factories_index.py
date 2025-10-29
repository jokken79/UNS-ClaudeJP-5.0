#!/usr/bin/env python3
"""
Regenerate factories_index.json from actual factory JSON files
"""
import json
from pathlib import Path
from datetime import datetime

def regenerate_factories_index():
    """Read all factory JSON files and create a new index"""
    factories_dir = Path('config/factories')
    
    if not factories_dir.exists():
        print(f"❌ Directory not found: {factories_dir}")
        return
    
    # Find all JSON files
    factory_files = sorted(factories_dir.glob('*.json'))
    
    print(f"📁 Found {len(factory_files)} factory JSON files")
    
    all_factories = []
    
    for factory_file in factory_files:
        print(f"  📄 Reading: {factory_file.name}")
        
        try:
            with open(factory_file, 'r', encoding='utf-8') as f:
                factory_data = json.load(f)
            
            factory_id = factory_data.get('factory_id')
            client_company = factory_data.get('client_company', {}).get('name', '')
            plant_name = factory_data.get('plant', {}).get('name', '')
            
            # Extract all lines from this factory
            lines = factory_data.get('lines', [])
            
            for line in lines:
                assignment = line.get('assignment', {})
                job = line.get('job', {})
                
                factory_entry = {
                    'factory_id': factory_id,
                    'client_company': client_company,
                    'plant_name': plant_name,
                    'department': assignment.get('department', ''),
                    'line': assignment.get('line', ''),
                    'hourly_rate': job.get('hourly_rate', 0.0)
                }
                
                all_factories.append(factory_entry)
        
        except Exception as e:
            print(f"  ⚠️ Error reading {factory_file.name}: {e}")
            continue
    
    # Create index structure
    index = {
        'total_factories': len(all_factories),
        'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'factories': all_factories
    }
    
    # Write to file
    output_file = Path('config/factories_index.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Successfully regenerated {output_file}")
    print(f"   Total factory entries: {len(all_factories)}")
    
    # Show summary by factory_id
    print("\n📊 Summary by factory:")
    factory_counts = {}
    for entry in all_factories:
        fid = entry['factory_id']
        factory_counts[fid] = factory_counts.get(fid, 0) + 1
    
    for fid, count in sorted(factory_counts.items()):
        print(f"   - {fid}: {count} lines")

if __name__ == '__main__':
    regenerate_factories_index()
