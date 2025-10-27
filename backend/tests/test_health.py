import pytest


@pytest.mark.parametrize("path", ["/api/health", "/health"])
def test_health_endpoints_return_ok(client, path):
    response = client.get(path, headers={"host": "localhost"})

    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"
    assert "timestamp" in data
