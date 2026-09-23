import pandas as pd


def extract_features(deployments: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(deployments)
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s")
    df["hour_of_day"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek
    df = df.sort_values("timestamp")

    df["minutes_since_last_deploy"] = (
        df.groupby("deployer")["timestamp"].diff().dt.total_seconds() / 60
    ).fillna(9999)

    df["deploys_in_last_60min"] = (
        df.set_index("timestamp")
        .groupby("deployer")["deploymentId"]
        .rolling("60min")
        .count()
        .reset_index(drop=True)
    )

    df["deployer_historical_avg_interval_minutes"] = df.groupby("deployer")[
        "minutes_since_last_deploy"
    ].transform(lambda x: x.expanding().mean())

    return df[
        [
            "deploymentId",
            "hour_of_day",
            "day_of_week",
            "minutes_since_last_deploy",
            "deploys_in_last_60min",
            "deployer_historical_avg_interval_minutes",
        ]
    ]
