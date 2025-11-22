# Mock Syllabus Data for Context
# In a real application, this might load from a JSON file or database

SYLLABUS_DATA = {
    "Physics": {
        "Rotation": {
            "Torque": ["Definition", "Calculation", "Equilibrium"],
            "Moment of Inertia": ["Ring", "Disc", "Sphere", "Rod"],
            "Angular Momentum": ["Conservation", "Relation with Torque"]
        },
        "Kinematics": {
            "1D Motion": ["Velocity", "Acceleration", "Graphs"],
            "Projectile Motion": ["Range", "Height", "Time of Flight"]
        }
    },
    "Mathematics": {
        "Calculus": {
            "Limits": ["Definition", "L'Hopital Rule"],
            "Derivatives": ["Chain Rule", "Product Rule"]
        }
    }
}

def get_syllabus_context():
    """Returns the syllabus structure as a string for LLM context."""
    import json
    return json.dumps(SYLLABUS_DATA, indent=2)
