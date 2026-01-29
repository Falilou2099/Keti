-- Migration: Add warranties and warranty_alerts tables
-- This script creates tables to track product warranties and user alerts for expiring warranties

-- Table: warranties
-- Stores warranty information for products purchased (linked to receipts)
CREATE TABLE IF NOT EXISTS warranties (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_duration_months INTEGER NOT NULL,
    expiration_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: warranty_alerts
-- Stores user-configured alerts for warranty expirations
CREATE TABLE IF NOT EXISTS warranty_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    warranty_id INTEGER NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
    alert_days_before INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_warranties_user_id ON warranties(user_id);
CREATE INDEX IF NOT EXISTS idx_warranties_expiration_date ON warranties(expiration_date);
CREATE INDEX IF NOT EXISTS idx_warranties_receipt_id ON warranties(receipt_id);

CREATE INDEX IF NOT EXISTS idx_warranty_alerts_user_id ON warranty_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_warranty_alerts_warranty_id ON warranty_alerts(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_alerts_is_active ON warranty_alerts(is_active);

-- Trigger to update updated_at for warranties
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON warranties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at for warranty_alerts
CREATE TRIGGER update_warranty_alerts_updated_at BEFORE UPDATE ON warranty_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE warranties IS 'Stores warranty information for purchased products';
COMMENT ON TABLE warranty_alerts IS 'Stores user-configured alerts for warranty expirations';
COMMENT ON COLUMN warranties.warranty_duration_months IS 'Duration of warranty in months';
COMMENT ON COLUMN warranties.expiration_date IS 'Calculated expiration date (purchase_date + warranty_duration_months)';
COMMENT ON COLUMN warranty_alerts.alert_days_before IS 'Number of days before expiration to trigger alert';
COMMENT ON COLUMN warranty_alerts.notified_at IS 'Timestamp when user was last notified about this alert';
