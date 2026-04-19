-- CreateIndex
CREATE INDEX "Delivery_droneProviderId_createdAt_idx" ON "Delivery"("droneProviderId", "createdAt");

-- CreateIndex
CREATE INDEX "DroneStatus_updatedAt_idx" ON "DroneStatus"("updatedAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");
