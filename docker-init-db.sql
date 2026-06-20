-- Initialize CIC databases
CREATE DATABASE cic;
CREATE DATABASE cic_lineage;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE cic TO cic;
GRANT ALL PRIVILEGES ON DATABASE cic_lineage TO cic;
GRANT USAGE ON SCHEMA public TO cic;
GRANT CREATE ON SCHEMA public TO cic;
