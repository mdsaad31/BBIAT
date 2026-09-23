import random
from datetime import datetime, timedelta


def generate_synthetic_deployments(n_normal=80):
    deployments = []
    base_time = datetime(2026, 1, 1, 9, 0)
    deployers = ["0xAcc1", "0xAcc2", "0xAcc3"]

    t = base_time
    for i in range(n_normal):
        t += timedelta(hours=random.uniform(4, 24))
        if t.weekday() >= 5:
            t += timedelta(days=2)
        deployments.append(
            {
                "deploymentId": i,
                "deployer": random.choice(deployers[:2]),
                "timestamp": int(t.timestamp()),
            }
        )

    anomaly_time = t + timedelta(hours=2)
    deployments.append(
        {
            "deploymentId": n_normal,
            "deployer": deployers[0],
            "timestamp": int(anomaly_time.replace(hour=3).timestamp()),
        }
    )

    burst_start = anomaly_time + timedelta(hours=1)
    for j in range(5):
        deployments.append(
            {
                "deploymentId": n_normal + 1 + j,
                "deployer": deployers[1],
                "timestamp": int((burst_start + timedelta(minutes=2 * j)).timestamp()),
            }
        )

    deployments.append(
        {
            "deploymentId": n_normal + 6,
            "deployer": deployers[2],
            "timestamp": int((burst_start + timedelta(hours=3)).timestamp()),
        }
    )
    return deployments
