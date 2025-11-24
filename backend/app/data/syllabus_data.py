# Mock Syllabus Data for Context
# In a real application, this might load from a JSON file or database

SYLLABUS_DATA = {
    "Physics": {
        "Mechanics": {
            "Kinematics": ["Position and Displacement", "Velocity", "Acceleration", "Equations of Motion", "Graphs", "Relative Motion"],
            "Laws of Motion": ["Newton's Laws", "Friction", "Circular Motion", "Impulse and Momentum", "Conservation Laws"],
            "Work, Energy and Power": ["Work Done", "Kinetic Energy", "Potential Energy", "Conservation of Energy", "Power", "Collisions"],
            "Rotation": ["Rotational Kinematics", "Torque", "Moment of Inertia", "Angular Momentum", "Rolling Motion", "Equilibrium"],
            "Gravitation": ["Universal Law", "Acceleration due to Gravity", "Gravitational Potential", "Orbital Velocity", "Escape Velocity", "Kepler's Laws", "Satellites"]
        },
        "Properties of Matter": {
            "Elasticity": ["Stress and Strain", "Hooke's Law", "Elastic Moduli", "Poisson's Ratio", "Energy Stored"],
            "Fluid Mechanics": ["Pressure", "Pascal's Law", "Archimedes Principle", "Buoyancy", "Continuity Equation", "Bernoulli's Theorem", "Viscosity", "Surface Tension"],
            "Thermal Properties": ["Heat Transfer", "Thermal Expansion", "Specific Heat", "Latent Heat", "Calorimetry"]
        },
        "Thermodynamics": {
            "Kinetic Theory": ["Gas Laws", "Kinetic Energy", "Mean Free Path", "Degrees of Freedom"],
            "Laws of Thermodynamics": ["Zeroth Law", "First Law", "Second Law", "Heat Engines", "Carnot Cycle", "Entropy", "Refrigerators"]
        },
        "Oscillations and Waves": {
            "Simple Harmonic Motion": ["Displacement", "Velocity", "Acceleration", "Energy", "Spring-Mass System", "Simple Pendulum"],
            "Waves": ["Wave Motion", "Transverse and Longitudinal Waves", "Speed of Wave", "Superposition", "Interference", "Standing Waves", "Beats", "Doppler Effect"],
            "Sound Waves": ["Characteristics", "Intensity", "Resonance", "Organ Pipes"]
        },
        "Electrostatics": {
            "Electric Charge": ["Coulomb's Law", "Electric Field", "Electric Field Lines", "Electric Flux", "Gauss's Law"],
            "Electric Potential": ["Potential Energy", "Potential Difference", "Equipotential Surfaces", "Potential due to Point Charge"],
            "Capacitance": ["Capacitors", "Series and Parallel", "Energy Stored", "Dielectrics", "Combinations"]
        },
        "Current Electricity": {
            "Electric Current": ["Drift Velocity", "Ohm's Law", "Resistance", "Resistivity", "Temperature Dependence"],
            "Circuits": ["Series and Parallel", "Kirchhoff's Laws", "Wheatstone Bridge", "Meter Bridge", "Potentiometer"],
            "Heating Effects": ["Joule's Law", "Electric Power", "Electrical Energy"]
        },
        "Magnetic Effects of Current": {
            "Magnetism": ["Magnetic Field", "Biot-Savart Law", "Ampere's Law", "Force on Current Carrying Conductor", "Torque on Current Loop"],
            "Magnetic Properties": ["Bar Magnet", "Earth's Magnetism", "Magnetization", "Hysteresis", "Dia, Para and Ferromagnetism"],
            "Electromagnetic Induction": ["Faraday's Law", "Lenz's Law", "Motional EMF", "Self and Mutual Inductance", "AC Generator", "Transformer"]
        },
        "Electromagnetic Waves": {
            "AC Circuits": ["AC Voltage and Current", "Phasors", "Reactance", "Impedance", "LC Oscillations", "LCR Circuits", "Resonance", "Power Factor"],
            "EM Waves": ["Displacement Current", "Maxwell's Equations", "EM Spectrum", "Properties"]
        },
        "Optics": {
            "Ray Optics": ["Reflection", "Refraction", "Total Internal Reflection", "Mirrors", "Lenses", "Prism", "Dispersion", "Optical Instruments"],
            "Wave Optics": ["Huygens Principle", "Interference", "Young's Double Slit", "Diffraction", "Polarization"]
        },
        "Modern Physics": {
            "Dual Nature": ["Photoelectric Effect", "Matter Waves", "De Broglie Wavelength", "Davisson-Germer Experiment"],
            "Atoms and Nuclei": ["Atomic Models", "Bohr Model", "Hydrogen Spectrum", "X-rays", "Radioactivity", "Nuclear Reactions", "Mass-Energy Equivalence"],
            "Semiconductors": ["Energy Bands", "Intrinsic and Extrinsic", "PN Junction", "Diode", "Transistor", "Logic Gates"]
        }
    },
    
    "Chemistry": {
        "Physical Chemistry": {
            "Atomic Structure": ["Subatomic Particles", "Atomic Models", "Quantum Numbers", "Electronic Configuration", "Periodic Trends"],
            "Chemical Bonding": ["Ionic Bond", "Covalent Bond", "Coordinate Bond", "Metallic Bond", "VSEPR Theory", "Hybridization", "Molecular Orbital Theory", "Hydrogen Bonding"],
            "States of Matter": ["Gas Laws", "Kinetic Theory", "Liquefaction", "Liquid State", "Solid State", "Crystal Lattice", "Unit Cells", "Defects"],
            "Thermodynamics": ["System and Surroundings", "Internal Energy", "Enthalpy", "Entropy", "Gibbs Energy", "First Law", "Second Law", "Hess's Law"],
            "Chemical Equilibrium": ["Law of Mass Action", "Equilibrium Constant", "Le Chatelier's Principle", "Ionic Equilibrium", "pH", "Buffer Solutions", "Solubility Product"],
            "Redox Reactions": ["Oxidation Number", "Balancing Equations", "Electrochemical Series"],
            "Chemical Kinetics": ["Rate of Reaction", "Order and Molecularity", "Integrated Rate Laws", "Activation Energy", "Collision Theory", "Catalysis"],
            "Electrochemistry": ["Conductance", "Kohlrausch's Law", "Electrochemical Cells", "Nernst Equation", "Electrolysis", "Batteries", "Corrosion"],
            "Solutions": ["Concentration Terms", "Raoult's Law", "Colligative Properties", "Ideal and Non-ideal Solutions"],
            "Surface Chemistry": ["Adsorption", "Catalysis", "Colloids", "Emulsions"]
        },
        "Inorganic Chemistry": {
            "Classification of Elements": ["Periodic Table", "Periodic Properties", "s-Block Elements", "p-Block Elements", "d-Block Elements", "f-Block Elements"],
            "Hydrogen": ["Position", "Isotopes", "Hydrides", "Water", "Hydrogen Peroxide"],
            "s-Block Elements": ["Alkali Metals", "Alkaline Earth Metals", "Compounds", "Anomalous Properties"],
            "p-Block Elements": {
                "Group 13": ["Boron Family", "Properties", "Compounds"],
                "Group 14": ["Carbon Family", "Allotropes", "Compounds"],
                "Group 15": ["Nitrogen Family", "Ammonia", "Nitric Acid", "Phosphorus Compounds"],
                "Group 16": ["Oxygen Family", "Ozone", "Sulfur", "Sulfuric Acid"],
                "Group 17": ["Halogens", "Hydrogen Halides", "Interhalogen Compounds"],
                "Group 18": ["Noble Gases", "Compounds"]
            },
            "d-Block Elements": ["General Properties", "Electronic Configuration", "Oxidation States", "Magnetic Properties", "Complex Formation", "Colored Ions", "Compounds"],
            "f-Block Elements": ["Lanthanoids", "Actinoids", "Properties", "Oxidation States"],
            "Coordination Compounds": ["Werner's Theory", "Nomenclature", "Isomerism", "Bonding", "Crystal Field Theory", "Stability"],
            "Environmental Chemistry": ["Pollution", "Atmospheric Pollution", "Water Pollution", "Soil Pollution", "Green Chemistry"]
        },
        "Organic Chemistry": {
            "Basic Concepts": ["IUPAC Nomenclature", "Isomerism", "Electronic Effects", "Reaction Mechanisms", "Resonance", "Hyperconjugation"],
            "Hydrocarbons": {
                "Alkanes": ["Nomenclature", "Preparation", "Properties", "Reactions", "Conformations"],
                "Alkenes": ["Nomenclature", "Preparation", "Properties", "Reactions", "Electrophilic Addition"],
                "Alkynes": ["Nomenclature", "Preparation", "Properties", "Reactions", "Acidic Nature"],
                "Aromatic Hydrocarbons": ["Benzene", "Aromaticity", "Electrophilic Substitution", "Reactions", "Directive Influence"]
            },
            "Organic Compounds with Functional Groups": {
                "Haloalkanes and Haloarenes": ["Nomenclature", "Preparation", "Properties", "Reactions", "Nucleophilic Substitution"],
                "Alcohols, Phenols and Ethers": ["Nomenclature", "Preparation", "Properties", "Reactions", "Acidity"],
                "Aldehydes and Ketones": ["Nomenclature", "Preparation", "Properties", "Nucleophilic Addition", "Reactions"],
                "Carboxylic Acids": ["Nomenclature", "Preparation", "Properties", "Acidity", "Reactions", "Derivatives"],
                "Amines": ["Nomenclature", "Preparation", "Properties", "Basicity", "Reactions", "Diazonium Salts"]
            },
            "Biomolecules": ["Carbohydrates", "Proteins", "Amino Acids", "Enzymes", "Nucleic Acids", "Vitamins", "Hormones"],
            "Polymers": ["Classification", "Addition Polymerization", "Condensation Polymerization", "Natural and Synthetic Polymers", "Rubber"],
            "Chemistry in Everyday Life": ["Drugs", "Chemicals in Food", "Cleansing Agents", "Antibiotics", "Antiseptics"]
        }
    },
    
    "Mathematics": {
        "Algebra": {
            "Sets and Relations": ["Set Theory", "Operations on Sets", "Venn Diagrams", "Relations", "Types of Relations", "Functions", "Types of Functions", "Composition", "Inverse Functions"],
            "Complex Numbers": ["Definition", "Algebraic Operations", "Argand Plane", "Modulus and Argument", "De Moivre's Theorem", "Roots of Unity", "Euler's Formula"],
            "Quadratic Equations": ["Solution Methods", "Nature of Roots", "Relation between Roots and Coefficients", "Formation of Equations", "Applications"],
            "Sequences and Series": ["Arithmetic Progression", "Geometric Progression", "Harmonic Progression", "Special Series", "Summation", "AM-GM-HM Inequality"],
            "Permutations and Combinations": ["Fundamental Principle", "Permutations", "Combinations", "Applications", "Binomial Theorem", "Pascal's Triangle"],
            "Binomial Theorem": ["Expansion", "General Term", "Middle Term", "Binomial Coefficients", "Applications"],
            "Matrices": ["Types", "Operations", "Transpose", "Determinants", "Adjoint", "Inverse", "Properties", "Solutions of Equations"],
            "Determinants": ["Properties", "Minors and Cofactors", "Expansion", "Applications", "Cramer's Rule"],
            "Probability": ["Basic Concepts", "Addition Theorem", "Conditional Probability", "Multiplication Theorem", "Bayes' Theorem", "Random Variables", "Distributions"]
        },
        "Calculus": {
            "Limits": ["Definition", "Evaluation", "L'Hospital's Rule", "Limits at Infinity", "Indeterminate Forms"],
            "Continuity": ["Definition", "Types of Discontinuity", "Properties", "Intermediate Value Theorem"],
            "Derivatives": ["Definition", "Rules of Differentiation", "Chain Rule", "Product Rule", "Quotient Rule", "Implicit Differentiation", "Parametric Differentiation", "Logarithmic Differentiation"],
            "Applications of Derivatives": ["Tangents and Normals", "Rate of Change", "Increasing and Decreasing Functions", "Maxima and Minima", "Rolle's Theorem", "Mean Value Theorem", "Approximations"],
            "Indefinite Integration": ["Basic Integrals", "Integration by Substitution", "Integration by Parts", "Partial Fractions", "Special Integrals"],
            "Definite Integration": ["Properties", "Fundamental Theorem", "Integration as Limit of Sum", "Applications"],
            "Area Under Curves": ["Area between Curves", "Area in Polar Coordinates"],
            "Differential Equations": ["Formation", "Order and Degree", "Solution of First Order Equations", "Linear Differential Equations", "Homogeneous Equations", "Applications"]
        },
        "Coordinate Geometry": {
            "Straight Lines": ["Slope", "Forms of Equations", "Distance Formula", "Section Formula", "Angle between Lines", "Perpendicular Distance"],
            "Circles": ["Standard Form", "General Form", "Tangent and Normal", "Chord", "Pair of Tangents", "Director Circle", "Family of Circles"],
            "Conic Sections": {
                "Parabola": ["Standard Forms", "Focus and Directrix", "Latus Rectum", "Tangent and Normal", "Properties"],
                "Ellipse": ["Standard Forms", "Eccentricity", "Foci", "Latus Rectum", "Tangent and Normal", "Properties"],
                "Hyperbola": ["Standard Forms", "Eccentricity", "Foci", "Asymptotes", "Tangent and Normal", "Properties"]
            },
            "3D Geometry": ["Direction Cosines and Ratios", "Equation of Line", "Equation of Plane", "Angle between Lines and Planes", "Distance Formulas", "Skew Lines"]
        },
        "Vector Algebra": {
            "Vectors": ["Definition", "Types", "Addition", "Scalar Multiplication", "Position Vector", "Section Formula"],
            "Dot Product": ["Definition", "Properties", "Projection", "Work Done", "Angle between Vectors"],
            "Cross Product": ["Definition", "Properties", "Area of Parallelogram", "Vector Triple Product", "Scalar Triple Product"]
        },
        "Trigonometry": {
            "Basic Trigonometry": ["Trigonometric Ratios", "Identities", "Compound Angles", "Multiple Angles", "Sub-Multiple Angles", "Transformation Formulas"],
            "Inverse Trigonometry": ["Definition", "Domain and Range", "Properties", "Graphs", "Equations"],
            "Solutions of Triangles": ["Sine Rule", "Cosine Rule", "Projection Rule", "Area of Triangle", "Properties of Triangle"],
            "Heights and Distances": ["Angle of Elevation", "Angle of Depression", "Applications"]
        },
        "Statistics": {
            "Measures of Dispersion": ["Range", "Mean Deviation", "Variance", "Standard Deviation", "Coefficient of Variation"],
            "Correlation": ["Scatter Diagram", "Coefficient of Correlation", "Properties"],
            "Regression": ["Lines of Regression", "Regression Coefficients", "Properties"]
        },
        "Mathematical Reasoning": ["Statements", "Logical Connectives", "Truth Tables", "Contrapositive", "Converse", "Validity of Statements"],
        "Linear Programming": ["Formulation", "Graphical Method", "Feasible Region", "Optimal Solution", "Applications"]
    },
    
    "Biology": {
        "Diversity of Living Organisms": {
            "Living World": ["Characteristics of Life", "Biodiversity", "Taxonomy", "Classification", "Nomenclature", "Taxonomic Hierarchy"],
            "Biological Classification": ["Five Kingdom Classification", "Monera", "Protista", "Fungi", "Plantae", "Animalia", "Viruses", "Lichens"],
            "Plant Kingdom": ["Algae", "Bryophytes", "Pteridophytes", "Gymnosperms", "Angiosperms", "Plant Life Cycles"],
            "Animal Kingdom": ["Phylum Porifera", "Coelenterata", "Platyhelminthes", "Nematoda", "Annelida", "Arthropoda", "Mollusca", "Echinodermata", "Chordata"]
        },
        "Structural Organization": {
            "Morphology of Flowering Plants": ["Root System", "Shoot System", "Leaf", "Inflorescence", "Flower", "Fruit", "Seed", "Families"],
            "Anatomy of Flowering Plants": ["Tissues", "Tissue Systems", "Anatomy of Root", "Stem", "Leaf", "Secondary Growth"],
            "Structural Organization in Animals": ["Animal Tissues", "Epithelial", "Connective", "Muscular", "Neural", "Organ Systems"]
        },
        "Cell Biology": {
            "Cell Structure": ["Cell Theory", "Prokaryotic Cell", "Eukaryotic Cell", "Cell Membrane", "Cell Wall", "Cell Organelles", "Nucleus"],
            "Biomolecules": ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids", "Enzymes", "Metabolism"],
            "Cell Cycle and Division": ["Cell Cycle", "Mitosis", "Meiosis", "Significance"]
        },
        "Plant Physiology": {
            "Transport in Plants": ["Water Absorption", "Transpiration", "Translocation", "Mineral Nutrition", "Nitrogen Metabolism"],
            "Photosynthesis": ["Photosynthetic Pigments", "Light Reaction", "Dark Reaction", "C3 and C4 Pathways", "Photorespiration", "Factors Affecting"],
            "Respiration": ["Glycolysis", "Krebs Cycle", "Electron Transport Chain", "Fermentation", "Respiratory Quotient"],
            "Plant Growth and Development": ["Growth", "Differentiation", "Development", "Plant Growth Regulators", "Photoperiodism", "Vernalization", "Seed Dormancy"]
        },
        "Human Physiology": {
            "Digestion and Absorption": ["Alimentary Canal", "Digestive Glands", "Digestion Process", "Absorption", "Disorders"],
            "Breathing and Respiration": ["Respiratory Organs", "Breathing Mechanism", "Exchange of Gases", "Transport of Gases", "Regulation", "Disorders"],
            "Body Fluids and Circulation": ["Blood", "Blood Groups", "Coagulation", "Lymph", "Heart", "Cardiac Cycle", "ECG", "Double Circulation", "Disorders"],
            "Excretory Products": ["Excretory System", "Nephron", "Urine Formation", "Regulation", "Disorders", "Dialysis"],
            "Locomotion and Movement": ["Skeletal System", "Joints", "Muscular System", "Muscle Contraction", "Disorders"],
            "Neural Control": ["Neuron", "Nerve Impulse", "Synapse", "Central Nervous System", "Peripheral Nervous System", "Reflex Action", "Sensory Organs"],
            "Chemical Coordination": ["Endocrine Glands", "Hormones", "Mechanism of Action", "Hypothalamus", "Pituitary", "Thyroid", "Adrenal", "Pancreas", "Gonads", "Disorders"]
        },
        "Reproduction": {
            "Reproduction in Organisms": ["Types", "Asexual Reproduction", "Sexual Reproduction", "Life Cycles"],
            "Sexual Reproduction in Flowering Plants": ["Pre-fertilization", "Pollination", "Fertilization", "Post-fertilization", "Seeds and Fruits", "Apomixis"],
            "Human Reproduction": ["Male Reproductive System", "Female Reproductive System", "Gametogenesis", "Menstrual Cycle", "Fertilization", "Pregnancy", "Parturition", "Lactation"],
            "Reproductive Health": ["Population Explosion", "Birth Control", "Contraception", "STDs", "Infertility", "ART"]
        },
        "Genetics and Evolution": {
            "Principles of Inheritance": ["Mendel's Laws", "Monohybrid Cross", "Dihybrid Cross", "Incomplete Dominance", "Co-dominance", "Multiple Alleles", "Polygenic Inheritance", "Pleiotropy"],
            "Molecular Basis": ["DNA Structure", "RNA Structure", "DNA Replication", "Transcription", "Translation", "Genetic Code", "Gene Expression", "Regulation", "Human Genome Project"],
            "Evolution": ["Origin of Life", "Theories of Evolution", "Evidence", "Darwin's Theory", "Natural Selection", "Hardy-Weinberg Principle", "Speciation", "Human Evolution"]
        },
        "Biology and Human Welfare": {
            "Health and Disease": ["Common Diseases", "Immunity", "Immune System", "Vaccines", "Allergies", "AIDS", "Cancer", "Drugs and Alcohol"],
            "Microbes in Human Welfare": ["Microbes in Household", "Industrial Products", "Sewage Treatment", "Biogas", "Biocontrol", "Biofertilizers"],
            "Biotechnology": ["Principles", "Genetic Engineering", "Recombinant DNA Technology", "PCR", "Cloning", "Applications"],
            "Biotechnology Applications": ["Agriculture", "Medicine", "Gene Therapy", "Transgenic Organisms", "Ethical Issues"]
        },
        "Ecology": {
            "Organisms and Environment": ["Habitat", "Abiotic Factors", "Biotic Factors", "Adaptations", "Population", "Population Growth", "Life History"],
            "Ecosystem": ["Structure", "Function", "Energy Flow", "Food Chains", "Food Webs", "Ecological Pyramids", "Nutrient Cycling", "Succession"],
            "Biodiversity": ["Levels", "Importance", "Loss of Biodiversity", "Conservation", "Threatened Species", "Red Data Book", "Biosphere Reserves"],
            "Environmental Issues": ["Pollution", "Global Warming", "Ozone Depletion", "Deforestation", "Waste Management", "Sustainable Development"]
        }
    }
}

def get_syllabus_context():
    """Returns the syllabus structure as a string for LLM context."""
    import json
    return json.dumps(SYLLABUS_DATA, indent=2)
